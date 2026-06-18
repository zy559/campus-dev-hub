"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import UserTagSelector from "@/components/user/UserTagSelector";

type Step = "form" | "verify";
type EmailStatus = "idle" | "checking" | "available" | "taken";

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
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const emailCheckRef = useRef(0);

  async function checkEmail(emailToCheck: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck)) return;
    const id = ++emailCheckRef.current;
    setEmailStatus("checking");
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck.trim().toLowerCase() }),
      });
      if (emailCheckRef.current !== id) return; // discard stale
      const data = await res.json();
      setEmailStatus(data.available ? "available" : "taken");
    } catch {
      setEmailStatus("idle");
    }
  }

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

    // 在发送验证码前校验所有字段，防止用户在步骤2提交时因不可见的错误而"没有反应"
    const fe: Record<string, string> = {};
    if (username.length < 2) fe.username = "用户名至少 2 个字符";
    else if (username.length > 20) fe.username = "用户名最多 20 个字符";
    else if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) fe.username = "用户名只能包含中英文、数字和下划线";
    if (!email) fe.email = "请输入邮箱地址";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fe.email = "邮箱格式不正确";
    else if (emailStatus === "taken") fe.email = "该邮箱已注册";
    if (password.length < 6) fe.password = "密码至少 6 个字符";
    else if (!/[a-zA-Z]/.test(password)) fe.password = "密码需包含字母";
    else if (!/[0-9]/.test(password)) fe.password = "密码需包含数字";
    if (password !== confirmPassword) fe.confirmPassword = "两次密码不一致";
    if (Object.keys(fe).length > 0) { setErrors(fe); return; }

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
    try {
      const res = await fetch("/api/auth/register-with-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: email.trim().toLowerCase(), password, tagIds: selectedTagIds, code }),
      });
      const text = await res.text();
      let data: { error?: string; success?: boolean } = {};
      try { data = JSON.parse(text); } catch { data = { error: "服务器异常" }; }

      if (!res.ok) {
        setLoading(false);
        setServerError(data.error || "注册失败");
        return;
      }

      // 注册+登录一体化，cookie 已由服务器设置
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      console.error("[Register] error:", err);
      setServerError(err instanceof TypeError && err.message === "Failed to fetch"
        ? "网络连接失败，请检查网络"
        : "请求失败，请稍后重试");
    }
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
            <div className="relative">
              <input id="reg-email" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailStatus("idle"); setErrors((prev) => { const n = { ...prev }; delete n.email; return n; }); }}
                onBlur={() => checkEmail(email)}
                className={`mt-1 block w-full rounded-lg border px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 transition-all pr-10 ${
                  emailStatus === "taken" ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" :
                  emailStatus === "available" ? "border-green-300 focus:border-green-400 focus:ring-green-400/20" :
                  "border-border focus:border-accent focus:ring-accent/20"
                }`}
                placeholder="your@email.com" autoComplete="email" />
              {emailStatus === "checking" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              )}
              {emailStatus === "available" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
              )}
              {emailStatus === "taken" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">✗</span>
              )}
            </div>
            {emailStatus === "taken" ? (
              <p className="mt-1 text-sm text-error">该邮箱已注册</p>
            ) : emailStatus === "available" ? (
              <p className="mt-1 text-xs text-green-600">该邮箱可用</p>
            ) : (
              <p className="mt-1 text-xs text-subtle">用于身份验证和找回密码，不会公开</p>
            )}
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

          {/* 显示来自步骤1字段的验证错误，防止用户看不到错误 */}
          {(errors.username || errors.email || errors.password || errors.confirmPassword) && (
            <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-lg text-sm space-y-1" role="alert">
              <p className="font-medium">请返回修正以下问题：</p>
              {errors.username && <p>• {errors.username}</p>}
              {errors.email && <p>• {errors.email}</p>}
              {errors.password && <p>• {errors.password}</p>}
              {errors.confirmPassword && <p>• {errors.confirmPassword}</p>}
            </div>
          )}

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
