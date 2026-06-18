import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToBlob } from "@/lib/upload";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/webm",
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("[upload] session user:", session?.user?.id || "NONE");

    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件格式：${file.type}。请上传 jpg/png/gif/webp/mp4/webm` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `文件 ${mb}MB 超过 10MB 限制` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "文件为空" }, { status: 400 });
    }

    console.log("[upload] uploading:", file.name, file.type, (file.size / 1024).toFixed(1) + "KB");

    try {
      const url = await uploadToBlob(file);
      console.log("[upload] success:", url);
      return NextResponse.json({ url }, { status: 201 });
    } catch (blobError: unknown) {
      console.error("[upload] Blob error:", JSON.stringify(blobError));
      const err = blobError as { message?: string; statusCode?: number };
      if (err.message?.includes("token") || err.statusCode === 401) {
        return NextResponse.json(
          { error: "Vercel Blob 未配置，请在 Vercel Dashboard 启用 Blob 存储" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `存储服务错误：${err.message || "请稍后重试"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[upload] error:", error);
    return NextResponse.json(
      { error: "上传失败，请重试" },
      { status: 500 }
    );
  }
}
