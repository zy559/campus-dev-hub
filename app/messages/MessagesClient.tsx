"use client";

import { useState } from "react";
import Link from "next/link";
import ConversationCard from "@/components/chat/ConversationCard";
import NewConversation from "@/components/chat/NewConversation";
import type { ConversationData } from "@/lib/types";

export default function MessagesClient({
  conversations,
}: {
  conversations: ConversationData[];
}) {
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="py-6">
      <div className="mb-6 rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-teal-600">会话中心</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950">聊天</h1>
            <p className="mt-2 text-sm text-slate-500">
              从组队、遇见、机会和主页自然开口。可以公开身份，也可以先半匿名聊聊。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-500"
            >
              发起聊天
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              返回发现
            </Link>
          </div>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-[1.75rem] border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-2xl">
            💬
          </div>
          <p className="mt-5 text-lg font-black text-slate-950">还没有对话</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            可以从同频卡、组队需求、个人主页或用户搜索发起聊天。第一句话不用尴尬，围炉会帮你准备开场白。
          </p>
          <button
            onClick={() => setShowNewChat(true)}
            className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            发起第一段对话
          </button>
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
