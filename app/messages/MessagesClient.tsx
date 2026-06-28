"use client";

import { useState } from "react";
import Link from "next/link";
import ConversationCard from "@/components/chat/ConversationCard";
import NewConversation from "@/components/chat/NewConversation";
import type { ConversationData } from "@/lib/types";

export default function MessagesClient({ conversations }: { conversations: ConversationData[] }) {
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="py-4 pb-24 lg:pb-8">
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-teal-700">会话中心</p>
            <h1 className="truncate text-2xl font-black text-slate-950">聊天</h1>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="shrink-0 rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-500"
          >
            发起聊天
          </button>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/88 px-6 py-14 text-center shadow-sm backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl text-teal-700">
            ✉
          </div>
          <p className="mt-5 text-lg font-black text-slate-950">还没有对话</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            可以从资料卡、组队需求、个人主页或用户搜索发起聊天。
          </p>
          <button
            onClick={() => setShowNewChat(true)}
            className="mt-6 inline-flex rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-500"
          >
            发起第一段对话
          </button>
          <Link href="/" className="ml-3 inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            返回推荐
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <ConversationCard key={conversation.id} {...conversation} />
          ))}
        </div>
      )}

      {showNewChat && <NewConversation onClose={() => setShowNewChat(false)} />}
    </div>
  );
}
