import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
      include: {
        participant1: { select: { id: true, username: true, avatar: true } },
        participant2: { select: { id: true, username: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = conversations.map((c) => ({
      id: c.id,
      otherUser:
        c.participant1Id === session.user!.id
          ? { id: c.participant2.id, username: c.participant2.username, avatar: c.participant2.avatar }
          : { id: c.participant1.id, username: c.participant1.username, avatar: c.participant1.avatar },
      lastMessage: c.messages[0]
        ? { content: c.messages[0].content, createdAt: c.messages[0].createdAt.toISOString() }
        : null,
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { participantId } = await request.json();
    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json({ error: "缺少目标用户" }, { status: 400 });
    }

    if (participantId === session.user.id) {
      return NextResponse.json({ error: "不能和自己对话" }, { status: 400 });
    }

    // 找到或创建对话（双向匹配）
    const existing = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: session.user.id, participant2Id: participantId },
          { participant1Id: participantId, participant2Id: session.user.id },
        ],
      },
      include: {
        participant1: { select: { id: true, username: true, avatar: true } },
        participant2: { select: { id: true, username: true, avatar: true } },
      },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        otherUser:
          existing.participant1Id === session.user!.id
            ? { id: existing.participant2.id, username: existing.participant2.username, avatar: existing.participant2.avatar }
            : { id: existing.participant1.id, username: existing.participant1.username, avatar: existing.participant1.avatar },
        updatedAt: existing.updatedAt.toISOString(),
      });
    }

    // 验证目标用户存在
    const targetUser = await db.user.findUnique({ where: { id: participantId } });
    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const conv = await db.conversation.create({
      data: {
        participant1Id: session.user.id,
        participant2Id: participantId,
      },
      include: {
        participant2: { select: { id: true, username: true, avatar: true } },
      },
    });

    return NextResponse.json({
      id: conv.id,
      otherUser: { id: conv.participant2.id, username: conv.participant2.username, avatar: conv.participant2.avatar },
      updatedAt: conv.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
