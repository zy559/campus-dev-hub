import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "缺少邮箱" }, { status: 400 });

    const existing = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
