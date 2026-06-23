import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageSchema } from "@/lib/validators";

function isParticipant(userId: string, conv: { participant1Id: string; participant2Id: string }) {
  return userId === conv.participant1Id || userId === conv.participant2Id;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const conv = await db.conversation.findUnique({ where: { id: params.id } });
    if (!conv || !isParticipant(session.user.id, conv)) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }

    const messages = await db.message.findMany({
      where: { conversationId: params.id },
      include: { sender: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        content: m.content,
        sender: m.sender,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const conv = await db.conversation.findUnique({ where: { id: params.id } });
    if (!conv || !isParticipant(session.user.id, conv)) {
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = MessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "消息无效", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        content: parsed.data.content,
        conversationId: params.id,
        senderId: session.user.id,
      },
      include: { sender: { select: { id: true, username: true, avatar: true } } },
    });

    // 更新对话时间
    await db.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      sender: message.sender,
      createdAt: message.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
