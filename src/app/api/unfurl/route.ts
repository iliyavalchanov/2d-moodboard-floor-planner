import { NextRequest, NextResponse } from "next/server";

// Force dynamic — never cache this route at the CDN level
export const dynamic = "force-dynamic";

/** Extract content from a meta tag by property or name */
function extractMeta(html: string, property: string): string | null {
  const byProp = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "is"
  );
  const byContent = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "is"
  );
  return byProp.exec(html)?.[1] ?? byContent.exec(html)?.[1] ?? null;
}

/** Check if HTML looks like a real page with OG metadata (not a WAF block page) */
function hasValidOgData(html: string): boolean {
  return !!extractMeta(html, "og:image") || !!extractMeta(html, "og:title");
}

/** Parse OG metadata from HTML string */
function parseOgMeta(html: string, origin: string) {
  const ogImage = extractMeta(html, "og:image");
  const ogTitle = extractMeta(html, "og:title");
  const ogDescription = extractMeta(html, "og:description");

  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = ogTitle ?? titleTagMatch?.[1]?.trim() ?? "";

  const metaDesc = extractMeta(html, "description");
  const description = ogDescription ?? metaDesc ?? "";

  let imageUrl: string | null = ogImage;
  if (imageUrl?.startsWith("//")) {
    imageUrl = "https:" + imageUrl;
  } else if (imageUrl?.startsWith("/")) {
    imageUrl = origin + imageUrl;
  }

  return { imageUrl, title, description };
}

/**
 * Fetch metadata via microlink.io — handles WAF-protected sites (IKEA, etc.)
 * using headless browser rendering. Free tier: 250 req/day.
 */
async function fetchViaMicrolink(url: string) {
  const res = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
    { cache: "no-store", signal: AbortSignal.timeout(12_000) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "success") return null;

  return {
    imageUrl: (data.data?.image?.url as string) ?? null,
    title: (data.data?.title as string) ?? "",
    description: (data.data?.description as string) ?? "",
  };
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    const domain = parsedUrl.hostname.replace(/^www\./, "");
    let result: { imageUrl: string | null; title: string; description: string } | null = null;

    // 1. Try direct fetch (fast path for sites that don't block server requests)
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(6_000),
      });

      if (response.ok) {
        const html = await response.text();
        if (hasValidOgData(html)) {
          const meta = parseOgMeta(html, parsedUrl.origin);
          if (meta.imageUrl) {
            result = meta;
          }
        }
      }
    } catch {
      // Direct fetch failed — will try microlink
    }

    // 2. Microlink fallback — handles WAF-blocked sites via headless browser
    if (!result) {
      try {
        result = await fetchViaMicrolink(url);
      } catch {
        // microlink failed
      }
    }

    if (!result || (!result.imageUrl && !result.title)) {
      return NextResponse.json(
        { error: "Could not extract metadata from page" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { imageUrl: result.imageUrl, title: result.title, description: result.description, domain },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to unfurl URL" },
      { status: 500 }
    );
  }
}
