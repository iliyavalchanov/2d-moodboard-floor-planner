import { NextRequest, NextResponse } from "next/server";

/** Extract content from a meta tag by property or name */
function extractMeta(html: string, property: string): string | null {
  // Match property="..." content="..." (either order, handles newlines)
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

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch page" },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extract OG metadata
    const ogImage = extractMeta(html, "og:image");
    const ogTitle = extractMeta(html, "og:title");
    const ogDescription = extractMeta(html, "og:description");

    // Fallback title to <title> tag
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitle ?? titleTagMatch?.[1]?.trim() ?? "";

    // Fallback description to meta description
    const metaDesc = extractMeta(html, "description");
    const description = ogDescription ?? metaDesc ?? "";

    if (!ogImage) {
      return NextResponse.json(
        { error: "No og:image found on page" },
        { status: 404 }
      );
    }

    // Resolve relative image URLs
    let imageUrl = ogImage;
    if (imageUrl.startsWith("//")) {
      imageUrl = parsedUrl.protocol + imageUrl;
    } else if (imageUrl.startsWith("/")) {
      imageUrl = parsedUrl.origin + imageUrl;
    }

    const domain = parsedUrl.hostname.replace(/^www\./, "");

    return NextResponse.json(
      { imageUrl, title, description, domain },
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
