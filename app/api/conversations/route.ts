import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatConversationForUser } from "@/lib/conversations";
import { getRequestUser } from "@/lib/wechatAuth";

export async function GET(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { participant1Id: requestUser.id },
          { participant2Id: requestUser.id },
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

    const result = await Promise.all(
      conversations.map(async (conversation) => {
        const isP1 = conversation.participant1Id === requestUser.id;
        const myReadAt = isP1 ? conversation.p1ReadAt : conversation.p2ReadAt;
        let unreadCount = 0;

        if (!myReadAt && conversation.messages.length > 0) {
          unreadCount = conversation._count.messages;
        } else if (myReadAt) {
          unreadCount = await db.message.count({
            where: { conversationId: conversation.id, createdAt: { gt: myReadAt } },
          });
        }

        return {
          ...formatConversationForUser({ conversation, currentUserId: requestUser.id }),
          lastMessage: conversation.messages[0]
            ? {
                content: conversation.messages[0].content.slice(0, 100),
                createdAt: conversation.messages[0].createdAt.toISOString(),
              }
            : null,
          unreadCount,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const { participantId } = await request.json();
    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json({ error: "Missing participantId" }, { status: 400 });
    }

    if (participantId === requestUser.id) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    const includeUsers = {
      participant1: { select: { id: true, username: true, avatar: true } },
      participant2: { select: { id: true, username: true, avatar: true } },
    };

    const existing = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: requestUser.id, participant2Id: participantId },
          { participant1Id: participantId, participant2Id: requestUser.id },
        ],
      },
      include: includeUsers,
    });

    if (existing) {
      return NextResponse.json(
        formatConversationForUser({ conversation: existing, currentUserId: requestUser.id })
      );
    }

    const targetUser = await db.user.findUnique({ where: { id: participantId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversation = await db.conversation.create({
      data: {
        participant1Id: requestUser.id,
        participant2Id: participantId,
        p1ReadAt: new Date(),
      },
      include: includeUsers,
    });

    return NextResponse.json(
      formatConversationForUser({ conversation, currentUserId: requestUser.id }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
