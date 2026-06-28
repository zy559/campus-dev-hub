"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageInput from "@/components/chat/MessageInput";

interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: { id: string; username: string; avatar: string | null };
  createdAt: string;
}

export default function ChatThread({
  conversationId,
  initialMessages,
  currentUserId,
  initialDraft,
  privateMode,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  initialDraft?: string;
  privateMode?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/conversations/${conversationId}/read`, { method: "POST" }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data);
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId]);

  async function handleSend(content: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) return false;
      const newMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <>
      {privateMode && (
        <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          隐私聊天模式：适合先轻量开口，注意不要发送敏感个人信息。
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-bold text-slate-600">发送第一条消息吧</p>
            <p className="mt-2 text-xs text-slate-500">可以用快捷开场白，或者先用隐私模式表达兴趣。</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isMine={message.sender.id === currentUserId}
            senderName={message.sender.username}
            senderAvatar={message.sender.avatar}
            createdAt={message.createdAt}
            privateMode={privateMode}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-200/80 py-3">
        <MessageInput onSend={handleSend} initialDraft={initialDraft} privateMode={privateMode} />
      </div>
    </>
  );
}
