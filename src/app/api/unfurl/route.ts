import { NextRequest, NextResponse } from "next/server";

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

/** Check if fetched HTML is a WAF block page rather than real content */
function isBlockPage(html: string): boolean {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim().toLowerCase() ?? "";
  return (
    title.includes("access denied") ||
    title.includes("forbidden") ||
    title.includes("blocked") ||
    title.includes("just a moment") // Cloudflare challenge
  );
}

/** Parse OG metadata from HTML string */
function parseOgMeta(html: string, parsedUrl: URL) {
  const ogImage = extractMeta(html, "og:image");
  const ogTitle = extractMeta(html, "og:title");
  const ogDescription = extractMeta(html, "og:description");

  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = ogTitle ?? titleTagMatch?.[1]?.trim() ?? "";

  const metaDesc = extractMeta(html, "description");
  const description = ogDescription ?? metaDesc ?? "";

  let imageUrl: string | null = ogImage;
  if (imageUrl?.startsWith("//")) {
    imageUrl = parsedUrl.protocol + imageUrl;
  } else if (imageUrl?.startsWith("/")) {
    imageUrl = parsedUrl.origin + imageUrl;
  }

  return { imageUrl, title, description };
}

/**
 * Fallback: use microlink.io metadata API for WAF-blocked sites.
 * Free tier, no API key needed.
 */
async function fetchViaMicrolink(url: string) {
  const res = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
    { signal: AbortSignal.timeout(10_000) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "success") return null;

  return {
    imageUrl: data.data?.image?.url ?? null,
    title: data.data?.title ?? "",
    description: data.data?.description ?? "",
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

    // 1. Try direct fetch
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const html = await response.text();
        if (!isBlockPage(html)) {
          const meta = parseOgMeta(html, parsedUrl);
          if (meta.imageUrl || meta.title) {
            result = meta;
          }
        }
      }
    } catch {
      // Will try fallback
    }

    // 2. Fallback to microlink.io for WAF-blocked or failed fetches
    if (!result) {
      try {
        result = await fetchViaMicrolink(url);
      } catch {
        // microlink also failed
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
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to unfurl URL" },
      { status: 500 }
    );
  }
}
