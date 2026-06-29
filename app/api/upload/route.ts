import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/upload";
import { getRequestUser } from "@/lib/wechatAuth";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];

function guessContentType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  return "image/jpeg";
}

async function readUploadFile(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const base64 = typeof body.base64 === "string" ? body.base64 : "";
    const fileName = typeof body.fileName === "string" ? body.fileName : `upload-${Date.now()}.jpg`;
    const type = typeof body.contentType === "string" ? body.contentType : guessContentType(fileName);
    if (!base64) return null;

    const binary = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ""), "base64");
    return new File([binary], fileName, { type });
  }

  const formData = await request.formData();
  return formData.get("file") as File | null;
}

export async function POST(request: Request) {
  try {
    const requestUser = await getRequestUser(request);

    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const file = await readUploadFile(request);

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
