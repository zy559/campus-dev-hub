"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserResult {
  id: string;
  username: string;
  avatar: string | null;
}

export default function NewConversation({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch { setResults([]); }
      finally { setLoading(false); }
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
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      router.push(`/messages/${data.id}`);
    } catch { setError("网络错误"); }
  }

  function avatarColor(name: string) {
    const colors = ["bg-amber-500", "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in ring-1 ring-slate-200 dark:ring-white/10">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">新对话</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索 */}
        <div className="p-4">
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索用户名..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
          {error && <p className="mt-2 text-sm text-red-500">⚠️ {error}</p>}
        </div>

        {/* 结果列表 */}
        <div className="max-h-72 overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-4">搜索中...</p>
          ) : query && results.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">没有找到匹配的用户</p>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((user) => (
                <button key={user.id} onClick={() => startConversation(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left">
                  <div className={`w-9 h-9 rounded-full ${avatarColor(user.username)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{user.username}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
