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
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = conversations.map((c) => {
      const isP1 = c.participant1Id === session.user!.id;
      const otherUser = isP1
        ? { id: c.participant2.id, username: c.participant2.username, avatar: c.participant2.avatar }
        : { id: c.participant1.id, username: c.participant1.username, avatar: c.participant1.avatar };
      const myReadAt = isP1 ? c.p1ReadAt : c.p2ReadAt;

      // 未读 = 从未读过 或 最后一条消息时间 > 读时间
      let unreadCount = 0;
      if (!myReadAt && c.messages.length > 0) {
        // 从未读过且有消息 → 显示总消息数
        unreadCount = c._count.messages;
      } else if (myReadAt) {
        // 只显示 readAt 之后的消息数（通过遍历 cursor 计算）
        // DB 层计数：消息总数 - 已读消息数
      }

      return {
        id: c.id,
        otherUser,
        lastMessage: c.messages[0]
          ? { content: c.messages[0].content.slice(0, 100), createdAt: c.messages[0].createdAt.toISOString() }
          : null,
        updatedAt: c.updatedAt.toISOString(),
        unreadCount,
      };
    });

    // 批量计算未读数
    for (let i = 0; i < result.length; i++) {
      const c = conversations[i];
      const isP1 = c.participant1Id === session.user!.id;
      const myReadAt = isP1 ? c.p1ReadAt : c.p2ReadAt;
      if (!myReadAt && c.messages.length > 0) {
        result[i].unreadCount = c._count.messages;
      } else if (myReadAt) {
        result[i].unreadCount = await db.message.count({
          where: { conversationId: c.id, createdAt: { gt: myReadAt } },
        });
      }
    }

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
      const isP1 = existing.participant1Id === session.user!.id;
      return NextResponse.json({
        id: existing.id,
        otherUser: isP1
          ? { id: existing.participant2.id, username: existing.participant2.username, avatar: existing.participant2.avatar }
          : { id: existing.participant1.id, username: existing.participant1.username, avatar: existing.participant1.avatar },
        updatedAt: existing.updatedAt.toISOString(),
      });
    }

    const targetUser = await db.user.findUnique({ where: { id: participantId } });
    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const conv = await db.conversation.create({
      data: {
        participant1Id: session.user.id,
        participant2Id: participantId,
        p1ReadAt: new Date(), // 创建者默认已读
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
