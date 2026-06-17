"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "请求失败，请重试");
        return;
      }

      setSent(true);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">📧</div>
          <h1 className="text-2xl font-bold text-ink mb-3">邮件已发送</h1>
          <p className="text-muted mb-8 leading-relaxed">
            如果 <strong>{email}</strong> 已注册围炉账号，你将会收到一封包含密码重置链接的邮件。
          </p>
          <p className="text-sm text-subtle mb-6">
            没收到？检查垃圾邮件箱，或等待几分钟后重试。
          </p>
          <Link href="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
            ← 返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink mb-2 text-center">找回密码</h1>
        <p className="text-muted text-center mb-8">
          输入注册邮箱，我们会发送重置链接
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-lg" role="alert">
              <span aria-hidden="true">⚠️ </span>{error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted">邮箱</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="your@email.com" autoComplete="email"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white py-2.5 px-4 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            {loading ? "发送中..." : "发送重置链接"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-muted hover:text-ink transition-colors">
              ← 返回登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
