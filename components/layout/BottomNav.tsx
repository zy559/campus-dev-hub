"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/", label: "推荐", icon: "★" },
  { href: "/activity?search=遇见", label: "喜欢", icon: "♡" },
  { href: "/activity", label: "动态", icon: "◎" },
  { href: "/messages", label: "消息", icon: "○" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  function active(href: string) {
    if (href === "/") return pathname === "/";
    const path = href.split("?")[0];
    return pathname.startsWith(path);
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white lg:hidden">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          {ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-2 py-2 ${active(item.href) ? "text-pink-500" : "text-slate-700"}`}>
              <span className="text-3xl leading-none">{item.icon}</span>
              <span className="text-[11px] font-bold">{item.label}</span>
            </Link>
          ))}

          {session ? (
            <button onClick={() => setProfileOpen(true)} className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-2 py-2 ${pathname.startsWith(`/profile/${session.user?.name}`) ? "text-pink-500" : "text-slate-700"}`}>
              <span className="text-3xl leading-none">♙</span>
              <span className="text-[11px] font-bold">我</span>
            </button>
          ) : (
            <Link href="/login" className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-2 py-2 text-slate-700">
              <span className="text-3xl leading-none">♙</span>
              <span className="text-[11px] font-bold">登录</span>
            </Link>
          )}
        </div>
      </nav>

      {profileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 pb-8 shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-300" />
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-lg font-bold text-white">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{session?.user?.name}</p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setProfileOpen(false);
                router.push(`/profile/${session?.user?.name}`);
              }}
              className="w-full rounded-xl px-4 py-3.5 text-left text-base font-medium text-slate-900 hover:bg-slate-100"
            >
              我的主页
            </button>
            <button
              onClick={() => {
                setProfileOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full rounded-xl px-4 py-3.5 text-left text-base font-medium text-red-500 hover:bg-red-50"
            >
              退出登录
            </button>
            <button onClick={() => setProfileOpen(false)} className="mt-3 w-full rounded-xl py-3 text-base font-medium text-slate-500 hover:bg-slate-100">
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}
