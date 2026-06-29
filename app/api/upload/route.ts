import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/upload";
import { getRequestUser } from "@/lib/wechatAuth";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];

export async function POST(request: Request) {
  try {
    const requestUser = await getRequestUser(request);

    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Please choose a file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json({ error: `File ${mb}MB exceeds 10MB limit` }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    try {
      const url = await uploadToBlob(file);
      return NextResponse.json({ url }, { status: 201 });
    } catch (blobError: unknown) {
      console.error("[upload] Blob error:", blobError);
      const err = blobError as { message?: string; statusCode?: number };
      if (err.message?.includes("token") || err.statusCode === 401) {
        return NextResponse.json({ error: "Vercel Blob is not configured" }, { status: 500 });
      }
      return NextResponse.json({ error: `Storage service error: ${err.message || "please retry later"}` }, { status: 500 });
    }
  } catch (error) {
    console.error("[upload] error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
