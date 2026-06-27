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
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  initialDraft?: string;
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
      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-bold text-muted">发送第一条消息吧</p>
            <p className="mt-2 text-xs text-subtle">可以用快捷开场白，或者先半匿名表达兴趣。</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isMine={message.sender.id === currentUserId}
            senderName={message.sender.username}
            createdAt={message.createdAt}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border py-3">
        <MessageInput onSend={handleSend} initialDraft={initialDraft} />
      </div>
    </>
  );
}
