"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginSchema } from "@/lib/validators";
import { ZodError } from "zod";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    try {
      LoginSchema.parse({ email, password });
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setServerError("邮箱或密码错误");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {serverError && (
        <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded" role="alert">
          <span aria-hidden="true">⚠️ </span>{serverError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted">邮箱</label>
        <input
          id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="your@email.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error" className="mt-1 text-sm text-error" role="alert">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-muted">密码</label>
        <input
          id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="输入密码" aria-invalid={!!errors.password} aria-describedby={errors.password ? "pw-error" : undefined}
        />
        {errors.password && <p id="pw-error" className="mt-1 text-sm text-error" role="alert">{errors.password}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-accent text-white py-2.5 px-4 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
