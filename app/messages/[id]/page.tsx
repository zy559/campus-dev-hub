import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { avatarColor } from "@/lib/utils";
import ChatThread from "./ChatThread";

export const dynamic = "force-dynamic";

export default async function MessageDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { opener?: string; mode?: string };
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
        <p className="text-lg text-slate-600">你没有权限查看此对话</p>
        <Link href="/messages" className="mt-4 inline-block text-teal-700 hover:text-teal-600">
          返回消息列表
        </Link>
      </div>
    );
  }

  const me = isP1 ? conversation.participant1 : conversation.participant2;
  const otherUser = isP1 ? conversation.participant2 : conversation.participant1;
  const isPrivateMode = searchParams?.mode === "private" || searchParams?.opener?.includes("匿名");
  const messages = await db.message.findMany({
    where: { conversationId: params.id },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto flex h-[calc(100svh-4rem)] max-w-4xl flex-col py-3 pb-20 lg:pb-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="rounded-full px-2 py-1 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-teal-700">
            ←
          </Link>
          <Avatar username={me.username} avatar={me.avatar} />
          <div className="flex -space-x-2">
            <Avatar username={otherUser.username} avatar={otherUser.avatar} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-950">{otherUser.username}</p>
            <p className="text-xs text-slate-500">你和 TA 的对话</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPrivateMode ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100" : "bg-teal-50 text-teal-700 ring-1 ring-teal-100"}`}>
            {isPrivateMode ? "隐私模式" : "普通模式"}
          </span>
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
        privateMode={isPrivateMode}
      />
    </div>
  );
}

function Avatar({ username, avatar }: { username: string; avatar: string | null }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white ring-2 ring-white"
      style={{ backgroundColor: avatarColor(username) }}
    >
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : username.charAt(0).toUpperCase()}
    </div>
  );
}
