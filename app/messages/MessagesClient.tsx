"use client";

import { useState } from "react";
import Link from "next/link";
import ConversationCard from "@/components/chat/ConversationCard";
import NewConversation from "@/components/chat/NewConversation";
import type { ConversationData } from "@/lib/types";

export default function MessagesClient({ conversations }: { conversations: ConversationData[] }) {
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">消息</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewChat(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-accent text-white px-4 py-2 rounded-full hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新对话
          </button>
          <Link href="/" className="text-sm text-muted hover:text-accent transition-colors">
            返回首页
          </Link>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-muted text-lg">暂无对话</p>
          <p className="text-subtle mt-2">去浏览帖子，找到感兴趣的用户发起聊天</p>
          <button
            onClick={() => setShowNewChat(true)}
            className="inline-block mt-4 text-accent hover:text-accent-hover font-medium transition-colors"
          >
            发起新对话 →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <ConversationCard key={c.id} {...c} />
          ))}
        </div>
      )}

      {showNewChat && <NewConversation onClose={() => setShowNewChat(false)} />}
    </div>
  );
}
