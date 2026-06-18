import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const conv = await db.conversation.findUnique({
      where: { id: params.id },
    });

    if (!conv) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }

    if (conv.participant1Id !== session.user.id && conv.participant2Id !== session.user.id) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 更新当前用户的 readAt
    if (conv.participant1Id === session.user.id) {
      await db.conversation.update({
        where: { id: params.id },
        data: { p1ReadAt: new Date() },
      });
    } else {
      await db.conversation.update({
        where: { id: params.id },
        data: { p2ReadAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
