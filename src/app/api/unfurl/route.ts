import { NextRequest, NextResponse } from "next/server";

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
        "User-Agent": "Mozilla/5.0 (compatible; MoodboardBot/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch page" },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extract og:image
    const ogImageMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    ) ?? html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );

    if (!ogImageMatch) {
      return NextResponse.json(
        { error: "No og:image found on page" },
        { status: 404 }
      );
    }

    // Extract og:title (fallback to <title>)
    const ogTitleMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    ) ?? html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i
    );
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitleMatch?.[1] ?? titleTagMatch?.[1]?.trim() ?? "";

    // Resolve relative image URLs
    let imageUrl = ogImageMatch[1];
    if (imageUrl.startsWith("//")) {
      imageUrl = parsedUrl.protocol + imageUrl;
    } else if (imageUrl.startsWith("/")) {
      imageUrl = parsedUrl.origin + imageUrl;
    }

    const domain = parsedUrl.hostname.replace(/^www\./, "");

    return NextResponse.json(
      { imageUrl, title, domain },
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
