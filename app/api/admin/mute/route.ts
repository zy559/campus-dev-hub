import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ error: "无权操作" }, { status: 403 });

    const { userId, muted } = await request.json();
    if (!userId || typeof muted !== "boolean") return NextResponse.json({ error: "参数无效" }, { status: 400 });

    await db.user.update({ where: { id: userId }, data: { muted } });
    return NextResponse.json({ success: true, muted });
  } catch { return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
