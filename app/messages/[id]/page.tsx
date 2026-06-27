import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ChatThread from "./ChatThread";

export const dynamic = "force-dynamic";

export default async function MessageDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { opener?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const conversation = await db.conversation.findUnique({
    where: { id: params.id },
    include: {
      participant1: { select: { id: true, username: true, avatar: true } },
      participant2: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!conversation) notFound();

  const isP1 = conversation.participant1Id === session.user.id;
  const isP2 = conversation.participant2Id === session.user.id;

  if (!isP1 && !isP2) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted">你没有权限查看此对话</p>
        <Link href="/messages" className="mt-4 inline-block text-accent hover:text-accent-hover">
          返回消息列表
        </Link>
      </div>
    );
  }

  const otherUser = isP1 ? conversation.participant2 : conversation.participant1;
  const messages = await db.message.findMany({
    where: { conversationId: params.id },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col py-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link href="/messages" className="text-sm font-semibold text-muted transition-colors hover:text-accent">
          ← 返回
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
          {otherUser.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-ink">{otherUser.username}</p>
          <p className="text-xs text-subtle">聊天中 · 注意保护隐私</p>
        </div>
      </div>

      <ChatThread
        conversationId={params.id}
        initialMessages={messages.map((message) => ({
          id: message.id,
          conversationId: message.conversationId,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt.toISOString(),
        }))}
        currentUserId={session.user.id}
        initialDraft={searchParams?.opener}
      />
    </div>
  );
}
