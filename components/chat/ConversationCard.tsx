import Link from "next/link";

interface ConversationCardProps {
  id: string;
  otherUser: { id: string; username: string; avatar: string | null };
  lastMessage?: { content: string; createdAt: string } | null;
}

export default function ConversationCard({ id, otherUser, lastMessage }: ConversationCardProps) {
  return (
    <Link
      href={`/messages/${id}`}
      className="glass-lift rounded-xl p-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
        {otherUser.username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{otherUser.username}</p>
        {lastMessage && (
          <p className="text-sm text-muted truncate">{lastMessage.content}</p>
        )}
      </div>
      {lastMessage && (
        <span className="text-xs text-subtle flex-shrink-0">
          {new Date(lastMessage.createdAt).toLocaleDateString("zh-CN")}
        </span>
      )}
    </Link>
  );
}
