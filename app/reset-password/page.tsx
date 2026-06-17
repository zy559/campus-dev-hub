"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) { setError("无效的重置链接，缺少 token"); return; }
    if (password.length < 6) { setError("密码至少 6 个字符"); return; }
    if (!/[a-zA-Z]/.test(password)) { setError("密码需包含至少一个字母"); return; }
    if (!/[0-9]/.test(password)) { setError("密码需包含至少一个数字"); return; }
    if (password !== confirmPassword) { setError("两次密码不一致"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "重置失败"); return; }

      setDone(true);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-ink mb-3">密码重置成功</h1>
          <p className="text-muted mb-8">现在可以使用新密码登录了</p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-full hover:bg-accent-hover transition-all duration-200 font-semibold"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-ink mb-3">无效的重置链接</h1>
          <p className="text-muted mb-8">这个链接缺失了必需的 token，请重新申请密码重置。</p>
          <Link href="/forgot-password" className="text-accent hover:text-accent-hover font-medium transition-colors">
            重新申请 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink mb-2 text-center">设置新密码</h1>
        <p className="text-muted text-center mb-8">输入你的新密码</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-lg" role="alert">
              <span aria-hidden="true">⚠️ </span>{error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted">新密码</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="至少 6 位，包含字母和数字" autoComplete="new-password" />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-muted">确认密码</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="再次输入新密码" autoComplete="new-password" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white py-2.5 px-4 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            {loading ? "重置中..." : "重置密码"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-muted text-sm">加载中...</div>
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
