import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ error: "无权操作" }, { status: 403 });

    const { userId, warned } = await request.json();
    if (!userId || typeof warned !== "boolean") return NextResponse.json({ error: "参数无效" }, { status: 400 });

    await db.user.update({ where: { id: userId }, data: { warned } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
