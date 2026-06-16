"use client";

import { useState, Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md glass rounded-2xl p-8 animate-scale-in">
        <h1 className="text-2xl font-bold text-center text-ink mb-6">
          {mode === "login" ? "登录 围炉" : "注册账号"}
        </h1>

        {mode === "login" ? <Suspense fallback={<div className="text-center text-sm text-muted">加载中...</div>}><LoginForm /></Suspense> : <RegisterForm />}

        <div className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              还没有账号？{" "}
              <button
                onClick={() => setMode("register")}
                className="text-accent hover:text-accent-hover font-medium transition-colors"
              >
                去注册
              </button>
            </>
          ) : (
            <>
              已有账号？{" "}
              <button
                onClick={() => setMode("login")}
                className="text-accent hover:text-accent-hover font-medium transition-colors"
              >
                去登录
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
