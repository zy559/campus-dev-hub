"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UserResult {
  id: string;
  username: string;
  avatar: string | null;
}

const identityModes = [
  ["公开身份", "对方看到你的昵称和主页"],
  ["半匿名", "先展示为一位同学，适合遇见和交友"],
  ["匿名提问", "适合咨询、求助和轻量开口"],
];

const openers = [
  "我看到你的需求，感觉挺契合的，可以聊聊吗？",
  "你好，我也对这件事感兴趣，想了解一下具体情况。",
  "我想匿名先问一下，可以吗？如果合适再互相介绍。",
  "我看到你的主页/标签，感觉我们可能挺同频的。",
];

export default function NewConversation({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(identityModes[0][0]);
  const [opener, setOpener] = useState(openers[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  async function startConversation(userId: string) {
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建对话失败");
        return;
      }
      router.push(`/messages/${data.id}?opener=${encodeURIComponent(`[${mode}] ${opener}`)}`);
    } catch {
      setError("网络错误，请稍后再试");
    }
  }

  function avatarColor(name: string) {
    const colors = ["bg-teal-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl animate-scale-in rounded-[1.75rem] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">发起聊天</h2>
            <p className="mt-1 text-xs text-slate-500">先选身份和开场白，再找同学开口。</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" aria-label="关闭">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">身份模式</p>
              <div className="space-y-2">
                {identityModes.map(([title, desc]) => (
                  <button
                    key={title}
                    onClick={() => setMode(title)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                      mode === title ? "bg-teal-50 ring-1 ring-teal-200" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-950">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black text-slate-500">快捷开场白</p>
              <div className="space-y-2">
                {openers.map((text) => (
                  <button
                    key={text}
                    onClick={() => setOpener(text)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-xs leading-5 transition ${
                      opener === text ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-black text-slate-500">搜索同学</p>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入用户名..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            <div className="mt-4 max-h-80 overflow-y-auto">
              {loading ? (
                <p className="py-8 text-center text-sm text-slate-400">搜索中...</p>
              ) : query && results.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">没有找到匹配的用户</p>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startConversation(user.id)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-teal-50"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarColor(user.username)} text-sm font-bold text-white`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-950">{user.username}</p>
                        <p className="truncate text-xs text-slate-500">{mode} · 点击进入聊天</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-bold text-slate-700">搜索用户后即可发起聊天</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">后续可以接入“从同频卡/组队卡直接聊天”的上下文开场。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
