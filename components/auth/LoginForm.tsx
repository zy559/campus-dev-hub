"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ZodError } from "zod";
import { LoginSchema } from "@/lib/validators";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setServerError("");

    try {
      LoginSchema.parse({ username, password });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);
    const result = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setServerError("用户名或密码错误");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      {serverError && (
        <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-error" role="alert">
          {serverError}
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
          onChange={(event) => setUsername(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="输入你的用户名"
          autoComplete="username"
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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-muted">
            密码
          </label>
          <Link href="/forgot-password" className="text-xs text-accent transition-colors hover:text-accent-hover">
            忘记密码？
          </Link>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          placeholder="输入密码"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "pw-error" : undefined}
        />
        {errors.password && (
          <p id="pw-error" className="mt-1 text-sm text-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
