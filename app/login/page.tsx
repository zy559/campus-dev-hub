"use client";

import { Suspense, useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in rounded-2xl p-8 glass">
        <h1 className="mb-2 text-center text-2xl font-bold text-ink">
          {mode === "login" ? "登录围炉" : "注册账号"}
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          发现机会，遇见同频的人。
        </p>

        {mode === "login" ? (
          <Suspense fallback={<div className="text-center text-sm text-muted">加载中...</div>}>
            <LoginForm />
          </Suspense>
        ) : (
          <RegisterForm />
        )}

        <div className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              还没有账号？{" "}
              <button onClick={() => setMode("register")} className="font-medium text-accent transition-colors hover:text-accent-hover">
                去注册
              </button>
            </>
          ) : (
            <>
              已有账号？{" "}
              <button onClick={() => setMode("login")} className="font-medium text-accent transition-colors hover:text-accent-hover">
                去登录
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
