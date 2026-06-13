interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  senderName: string;
  createdAt: string;
}

export default function MessageBubble({ content, isMine, senderName, createdAt }: MessageBubbleProps) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] ${isMine ? "order-1" : "order-1"}`}>
        {!isMine && (
          <p className="text-xs text-muted ml-1 mb-1">{senderName}</p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isMine
              ? "bg-accent text-white rounded-br-md"
              : "bg-surface-alt text-ink rounded-bl-md border border-border"
          }`}
        >
          {content}
        </div>
        <p className={`text-xs text-subtle mt-1 ${isMine ? "text-right mr-1" : "ml-1"}`}>
          {new Date(createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
