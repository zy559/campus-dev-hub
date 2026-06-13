"use client";

import { useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    await onSend(content.trim());
    setContent("");
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        rows={1}
        placeholder="输入消息... (Enter 发送)"
        className="flex-1 resize-none rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
      <button
        type="submit"
        disabled={!content.trim() || sending}
        className="bg-accent text-white px-5 rounded-xl hover:bg-accent-hover disabled:opacity-40 transition-colors text-sm font-medium"
      >
        {sending ? "..." : "发送"}
      </button>
    </form>
  );
}
