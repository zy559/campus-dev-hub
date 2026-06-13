import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ error: "无权操作" }, { status: 403 });

    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });

    await db.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "服务器内部错误" }, { status: 500 }); }
}
