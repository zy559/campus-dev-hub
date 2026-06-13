import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import ChatThread from "./ChatThread";

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const conv = await db.conversation.findUnique({
    where: { id: params.id },
    include: {
      participant1: { select: { id: true, username: true, avatar: true } },
      participant2: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!conv) notFound();

  const isP1 = conv.participant1Id === session.user.id;
  const isP2 = conv.participant2Id === session.user.id;
  if (!isP1 && !isP2) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <p className="text-muted text-lg">你没有权限查看此对话</p>
        <Link href="/messages" className="text-accent hover:text-accent-hover mt-4 inline-block">
          返回消息列表
        </Link>
      </div>
    );
  }

  const otherUser = isP1 ? conv.participant2 : conv.participant1;

  const messages = await db.message.findMany({
    where: { conversationId: params.id },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶部 */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <Link href="/messages" className="text-muted hover:text-accent transition-colors">
          ← 返回
        </Link>
        <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm">
          {otherUser.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-ink">{otherUser.username}</span>
      </div>

      {/* 消息列表 */}
      <ChatThread
        conversationId={params.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          content: m.content,
          sender: m.sender,
          createdAt: m.createdAt.toISOString(),
        }))}
        currentUserId={session.user.id}
      />
    </div>
  );
}
