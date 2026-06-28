import Link from "next/link";
import { avatarColor } from "@/lib/utils";

interface ConversationCardProps {
  id: string;
  otherUser: { id: string; username: string; avatar: string | null };
  lastMessage?: { content: string; createdAt: string } | null;
}

export default function ConversationCard({ id, otherUser, lastMessage }: ConversationCardProps) {
  return (
    <Link
      href={`/messages/${id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/88 p-4 shadow-sm backdrop-blur transition hover:border-teal-200 hover:shadow-md"
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: avatarColor(otherUser.username) }}
      >
        {otherUser.avatar ? <img src={otherUser.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : otherUser.username.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-950">{otherUser.username}</p>
        {lastMessage ? (
          <p className="truncate text-sm text-slate-600">{lastMessage.content}</p>
        ) : (
          <p className="text-sm text-slate-500">还没有消息</p>
        )}
      </div>
      {lastMessage && (
        <span className="flex-shrink-0 text-xs text-slate-500">
          {new Date(lastMessage.createdAt).toLocaleDateString("zh-CN")}
        </span>
      )}
    </Link>
  );
}
