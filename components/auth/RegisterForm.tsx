"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RegisterSchema } from "@/lib/validators";
import { ZodError } from "zod";
import UserTagSelector from "@/components/user/UserTagSelector";

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    try {
      RegisterSchema.parse({ username, email, password, tagIds: selectedTagIds });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, tagIds: selectedTagIds }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setServerError(data.error || "注册失败，请重试");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setServerError("注册成功，但自动登录失败，请手动登录");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {serverError && (
        <div
          className="bg-error-bg border border-error-border text-error px-4 py-3 rounded"
          role="alert"
        >
          <span aria-hidden="true">⚠️ </span>{serverError}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-muted">
          用户名
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="你的用户名"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? "username-error" : undefined}
        />
        {errors.username && (
          <p id="username-error" className="mt-1 text-sm text-error" role="alert">
            {errors.username}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-muted">
          邮箱
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="your@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
        />
        {errors.email && (
          <p id="reg-email-error" className="mt-1 text-sm text-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-muted">
          密码
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="至少 6 位密码"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "reg-password-error" : undefined}
        />
        {errors.password && (
          <p id="reg-password-error" className="mt-1 text-sm text-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <UserTagSelector
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
        maxTags={5}
        label="选择你的兴趣标签（帮助找到志同道合的人）"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "注册中..." : "注册"}
      </button>
    </form>
  );
}
