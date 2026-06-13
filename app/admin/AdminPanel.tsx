"use client";

import { useState } from "react";
import Link from "next/link";

interface UserRow {
  id: string; username: string; email: string; role: string;
  warned: boolean; muted: boolean; bannedUntil: string | null;
  createdAt: string;
  postCount: number; commentCount: number;
}

export default function AdminPanel({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState(users);
  const [msg, setMsg] = useState("");

  const filtered = list.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function action(url: string, body: object, okMsg: string) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const d = await res.json(); setMsg(d.error || "失败"); return; }
    setMsg(okMsg);
    const data = await res.json();
    // update local list
    setList(prev => prev.map(u => u.id === (body as { userId: string }).userId
      ? { ...u, ...(data.muted !== undefined ? { muted: data.muted } : {}), ...(data.bannedUntil !== undefined ? { bannedUntil: data.bannedUntil } : {}), ...(data.warned !== undefined ? { warned: data.warned } : {}) }
      : u
    ));
  }

  async function deletePost(postId: string) {
    if (!confirm("确定删除此帖子？")) return;
    const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
    setMsg(res.ok ? "帖子已删除" : "删除失败");
  }

  return (
    <div>
      {msg && <div className="bg-accent-subtle text-accent px-4 py-2 rounded mb-4 text-sm">{msg}</div>}

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索用户名或邮箱..."
        className="block w-full mb-6 rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />

      <div className="space-y-3">
        {filtered.map(u => (
          <div key={u.id} className={`glass rounded-xl p-4 ${u.warned ? "ring-2 ring-yellow-400/50" : ""} ${u.muted ? "ring-2 ring-orange-400/50" : ""} ${u.bannedUntil && new Date(u.bannedUntil) > new Date() ? "ring-2 ring-red-400/50" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${u.username}`} className="font-medium text-ink hover:text-accent">{u.username}</Link>
                  {u.role === "admin" && <span className="text-xs bg-accent-subtle text-accent px-1.5 rounded">管理员</span>}
                  {u.warned && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded">⚠ 已警告</span>}
                  {u.muted && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 rounded">🔇 禁言</span>}
                  {u.bannedUntil && new Date(u.bannedUntil) > new Date() && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">
                      🚫 封禁至 {new Date(u.bannedUntil).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-subtle mt-0.5">{u.email} · {u.postCount} 帖 · {u.commentCount} 评</p>
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => action("/api/admin/warn", { userId: u.id, warned: !u.warned }, u.warned ? "已取消警告" : "已警告")}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${u.warned ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"}`}>
                  {u.warned ? "取消警告" : "警告"}
                </button>
                <button onClick={() => action("/api/admin/mute", { userId: u.id, muted: !u.muted }, u.muted ? "已解除禁言" : "已禁言")}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${u.muted ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
                  {u.muted ? "解除禁言" : "禁言"}
                </button>
                <button onClick={() => { const d = prompt("封禁天数（0=解封）："); if (d !== null) action("/api/admin/ban", { userId: u.id, days: parseInt(d) || 0 }, parseInt(d || "0") > 0 ? `已封禁 ${d} 天` : "已解封"); }}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${u.bannedUntil ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                  {u.bannedUntil ? "封禁中" : "封禁"}
                </button>
              </div>
            </div>

            {/* 该用户的帖子列表 */}
            {u.postCount > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-muted cursor-pointer hover:text-accent">查看帖子 ({u.postCount})</summary>
                <UserPosts userId={u.id} onDelete={deletePost} />
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UserPosts({ userId, onDelete }: { userId: string; onDelete: (id: string) => void }) {
  const [posts, setPosts] = useState<Array<{ id: string; title: string; createdAt: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (loaded) return;
    const res = await fetch(`/api/posts?limit=50`);
    const data = await res.json();
    setPosts((data.posts || []).filter((p: { author: { id: string } }) => p.author.id === userId));
    setLoaded(true);
  }

  return (
    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto" onClick={load}>
      {!loaded && <p className="text-xs text-subtle cursor-pointer">点击加载...</p>}
      {loaded && posts.length === 0 && <p className="text-xs text-subtle">暂无帖子</p>}
      {posts.map(p => (
        <div key={p.id} className="flex items-center justify-between text-xs">
          <Link href={`/posts/${p.id}`} className="text-ink hover:text-accent truncate flex-1">{p.title}</Link>
          <span className="text-subtle mx-2">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
          <button onClick={() => onDelete(p.id)} className="text-red-500 hover:text-red-700">删除</button>
        </div>
      ))}
    </div>
  );
}
