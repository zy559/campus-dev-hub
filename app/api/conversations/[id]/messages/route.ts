import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MessageSchema } from "@/lib/validators";
import { getRequestUser } from "@/lib/wechatAuth";

function isParticipant(userId: string, conv: { participant1Id: string; participant2Id: string }) {
  return userId === conv.participant1Id || userId === conv.participant2Id;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const conv = await db.conversation.findUnique({ where: { id: params.id } });
    if (!conv || !isParticipant(requestUser.id, conv)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await db.message.findMany({
      where: { conversationId: params.id },
      include: { sender: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      messages.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        sender: message.sender,
        mine: message.sender.id === requestUser.id,
        createdAt: message.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestUser = await getRequestUser(request);
    if (!requestUser?.id) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const conv = await db.conversation.findUnique({ where: { id: params.id } });
    if (!conv || !isParticipant(requestUser.id, conv)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = MessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        content: parsed.data.content,
        conversationId: params.id,
        senderId: requestUser.id,
      },
      include: { sender: { select: { id: true, username: true, avatar: true } } },
    });

    await db.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      sender: message.sender,
      mine: true,
      createdAt: message.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
