"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserTagSelector from "@/components/user/UserTagSelector";

type Step = "form" | "verify";

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [code, setCode] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function startCountdown() {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    setErrors({});
    setServerError("");

    if (!email) { setErrors({ email: "请输入邮箱地址" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: "邮箱格式不正确" }); return; }

    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || "发送失败"); return; }
      setStep("verify");
      startCountdown();
    } catch {
      setServerError("网络错误，请重试");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const fe: Record<string, string> = {};
    if (username.length < 2) fe.username = "用户名至少 2 个字符";
    else if (username.length > 20) fe.username = "用户名最多 20 个字符";
    else if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) fe.username = "用户名只能包含中英文、数字和下划线";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fe.email = "邮箱格式不正确";
    if (password.length < 6) fe.password = "密码至少 6 个字符";
    else if (!/[a-zA-Z]/.test(password)) fe.password = "密码需包含字母";
    else if (!/[0-9]/.test(password)) fe.password = "密码需包含数字";
    if (password !== confirmPassword) fe.confirmPassword = "两次密码不一致";
    if (code.length !== 6) fe.code = "请输入 6 位验证码";
    if (Object.keys(fe).length > 0) { setErrors(fe); return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email: email.trim().toLowerCase(), password, tagIds: selectedTagIds, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setServerError(data.error || "注册失败"); return; }

    const result = await signIn("credentials", { username, password, redirect: false });
    if (result?.error) {
      setServerError("注册成功！请手动登录。");
      router.push("/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  function pwStrength() {
    if (password.length < 6) return { label: "", color: "bg-slate-200", w: "0%" };
    const l = /[a-zA-Z]/.test(password);
    const d = /[0-9]/.test(password);
    const s = /[^a-zA-Z0-9]/.test(password);
    if (l && d && s && password.length >= 8) return { label: "强", color: "bg-green-500", w: "100%" };
    if (l && d && password.length >= 6) return { label: "中", color: "bg-amber-500", w: "66%" };
    return { label: "弱", color: "bg-red-400", w: "33%" };
  }
  const ps = pwStrength();

  return (
    <div className="max-w-md mx-auto">
      {serverError && (
        <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-lg mb-4" role="alert">
          <span aria-hidden="true">⚠️ </span>{serverError}
        </div>
      )}

      {step === "form" ? (
        /* === Step 1 === */
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-muted">用户名</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="你的用户名（登录用）" autoComplete="username" />
            {errors.username && <p className="mt-1 text-sm text-error">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-muted">邮箱</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="your@email.com" autoComplete="email" />
            <p className="mt-1 text-xs text-subtle">用于身份验证和找回密码，不会公开</p>
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-muted">密码</label>
            <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="至少 6 位，包含字母和数字" autoComplete="new-password" />
            {password.length >= 6 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${ps.color}`} style={{ width: ps.w }} />
                </div>
                <span className="text-xs text-muted">{ps.label}</span>
              </div>
            )}
            {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-muted">确认密码</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="再次输入密码" autoComplete="new-password" />
            {errors.confirmPassword && <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>}
          </div>

          <UserTagSelector selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} maxTags={5}
            label="选择兴趣标签（可选）" />

          <button type="button" onClick={handleSendCode} disabled={sendingCode}
            className="w-full bg-accent text-white py-2.5 px-4 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            {sendingCode ? "发送中..." : "发送验证码"}
          </button>
        </div>
      ) : (
        /* === Step 2 === */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-accent-subtle border border-accent/20 rounded-lg p-4 text-sm text-accent">
            验证码已发送至 <strong>{email}</strong>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-muted">邮箱验证码</label>
            <input id="code" type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm text-center text-2xl tracking-[8px] font-mono focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="000000" autoComplete="one-time-code" />
            {errors.code && <p className="mt-1 text-sm text-error">{errors.code}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white py-2.5 px-4 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            {loading ? "注册中..." : "完成注册"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button type="button" onClick={() => setStep("form")} className="text-muted hover:text-ink transition-colors">← 返回</button>
            <button type="button" onClick={handleSendCode} disabled={countdown > 0 || sendingCode}
              className="text-accent hover:text-accent-hover disabled:text-subtle transition-colors">
              {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
