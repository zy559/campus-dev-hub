"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
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

            <Link href={`/profile/${session.user?.name}`} className={itemClass("/profile")}>
              <div className={`w-6 h-6 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-xs ring-1 ${
                isActive("/profile") ? "ring-accent" : "ring-transparent"
              }`}>
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-[11px] font-medium">我的</span>
            </Link>
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
  );
}
