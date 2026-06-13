import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import ConversationCard from "@/components/chat/ConversationCard";
import type { ConversationData } from "@/lib/types";
export const dynamic = 'force-dynamic';

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

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">消息</h1>
        <Link href="/" className="text-sm text-muted hover:text-accent transition-colors">
          返回首页
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-muted text-lg">暂无对话</p>
          <p className="text-subtle mt-2">去浏览帖子，找到感兴趣的用户发起聊天</p>
          <Link href="/" className="inline-block mt-4 text-accent hover:text-accent-hover font-medium transition-colors">
            去发现内容 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <ConversationCard key={c.id} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}
