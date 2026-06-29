import { NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "public.blob.vercel-storage.com",
  "blob.vercel-storage.com",
  "images.unsplash.com",
  "images.pexels.com",
  "res.cloudinary.com",
  "qcloud.la",
  "tcb.qcloud.la",
  "bing.net",
];

function isAllowedImageUrl(url: URL) {
  if (url.protocol !== "https:") return false;
  return ALLOWED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");
    if (!rawUrl) {
      return NextResponse.json({ error: "Missing image url" }, { status: 400 });
    }

    const imageUrl = new URL(rawUrl);
    if (!isAllowedImageUrl(imageUrl)) {
      return NextResponse.json({ error: "Image host is not allowed" }, { status: 400 });
    }

    const upstream = await fetch(imageUrl, {
      headers: { accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Image fetch failed" }, { status: upstream.status || 502 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") || "image/jpeg",
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[image-proxy] error:", error);
    return NextResponse.json({ error: "Image proxy failed" }, { status: 500 });
  }
}
