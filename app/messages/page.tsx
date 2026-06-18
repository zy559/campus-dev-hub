import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import MessagesClient from "./MessagesClient";
import type { ConversationData } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

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

  const data: ConversationData[] = conversations.map((c) => ({
    id: c.id,
    otherUser:
      c.participant1Id === session.user.id
        ? { id: c.participant2.id, username: c.participant2.username, avatar: c.participant2.avatar }
        : { id: c.participant1.id, username: c.participant1.username, avatar: c.participant1.avatar },
    lastMessage: c.messages[0]
      ? { content: c.messages[0].content, createdAt: c.messages[0].createdAt.toISOString() }
      : undefined,
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <MessagesClient conversations={data} />;
}
