"use client";

import { useState } from "react";

export default function ImpersonateClient() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const username = keyword.trim();
    if (!username) return;
    setLoading(true);
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "模拟登录失败");
      return;
    }
    window.location.href = "/";
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur">
      <label className="block">
        <span className="text-sm font-bold text-slate-700">输入要登录的用户名</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="例如：zhangsan"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
        />
      </label>
      {message && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{message}</p>}
      <button disabled={loading} className="mt-5 w-full rounded-full bg-amber-500 py-3 text-sm font-bold text-white disabled:opacity-60">
        {loading ? "进入中..." : "模拟登录"}
      </button>
    </form>
  );
}
