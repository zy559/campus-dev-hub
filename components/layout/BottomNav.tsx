"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function itemClass(href: string) {
    return `flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-h-[44px] rounded-lg transition-colors ${
      isActive(href) ? "text-accent" : "text-subtle"
    }`;
  }

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          <Link href="/" className={itemClass("/")}>
            <svg className="w-6 h-6" fill={isActive("/") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[11px] font-medium">首页</span>
          </Link>

          <Link href="/boards" className={itemClass("/boards")}>
            <svg className="w-6 h-6" fill={isActive("/boards") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-[11px] font-medium">板块</span>
          </Link>

          <Link href="/posts/new" className={itemClass("/posts/new")}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
              isActive("/posts/new") ? "bg-accent text-white" : "bg-accent text-white"
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-accent">发帖</span>
          </Link>

          {session ? (
            <>
              <Link href="/messages" className={itemClass("/messages")}>
                <svg className="w-6 h-6" fill={isActive("/messages") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-[11px] font-medium">消息</span>
              </Link>

              {/* 我的 — 点击弹出菜单 */}
              <button
                onClick={() => setProfileOpen(true)}
                className={itemClass(`/profile/${session.user?.name}`)}
              >
                <div className={`w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-xs ring-1 ${
                  isActive(`/profile/${session.user?.name}`) ? "ring-accent" : "ring-transparent"
                }`}>
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-[11px] font-medium">我的</span>
              </button>
            </>
          ) : (
            <Link href="/login" className={itemClass("/login")}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[11px] font-medium">登录</span>
            </Link>
          )}
        </div>
      </nav>

      {/* 底部弹出菜单：个人主页 / 退出登录 */}
      {profileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setProfileOpen(false)}
          />
          {/* 菜单面板 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl animate-slide-up p-6 pb-8"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
            {/* 拖拽指示条 */}
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-5" />

            {/* 用户信息 */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg font-bold">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* 菜单项 */}
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push(`/profile/${session?.user?.name}`);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              个人主页
            </button>

            <button
              onClick={() => {
                setProfileOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              退出登录
            </button>

            {/* 取消 */}
            <button
              onClick={() => setProfileOpen(false)}
              className="w-full mt-3 py-3 text-base font-medium text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}
