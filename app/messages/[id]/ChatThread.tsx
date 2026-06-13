"use client";

import { useState, useEffect, useRef } from "react";
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
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  // currentUserId is passed from server component
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 轮询新消息（每 5 秒）
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

  async function handleSend(content: string) {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-subtle py-10">发送第一条消息吧</p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isMine={msg.sender.id === currentUserId}
            senderName={msg.sender.username}
            createdAt={msg.createdAt}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="py-3 border-t border-border">
        <MessageInput onSend={handleSend} />
      </div>
    </>
  );
}
