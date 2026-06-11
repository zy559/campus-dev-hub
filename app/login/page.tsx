"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === "login" ? "登录" : "注册"}
        </h1>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              还没有账号？{" "}
              <button
                onClick={() => setMode("register")}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                去注册
              </button>
            </>
          ) : (
            <>
              已有账号？{" "}
              <button
                onClick={() => setMode("login")}
                className="text-orange-600 hover:text-orange-800 font-medium"
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
