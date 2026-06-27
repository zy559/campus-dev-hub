"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [publishOpen, setPublishOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white lg:hidden">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-2">
          <Tab href="/" label="推荐" icon="◇" active={isActive("/")} />
          <Tab href="/activity" label="动态" icon="○" active={isActive("/activity")} />

          <button onClick={() => setPublishOpen(true)} className="flex flex-col items-center justify-center gap-0.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-3xl font-light leading-none text-white shadow-lg shadow-teal-200">
              +
            </span>
            <span className="text-[11px] font-bold text-teal-700">发布</span>
          </button>

          <Tab href="/messages" label="聊天" icon="□" active={isActive("/messages")} />
          <Tab href={session ? "/me" : "/login"} label={session ? "我" : "登录"} icon="◌" active={isActive(session ? "/me" : "/login")} />
        </div>
      </nav>

      {publishOpen && (
        <Sheet onClose={() => setPublishOpen(false)}>
          <h2 className="text-lg font-black text-slate-950">你想发布什么？</h2>
          <p className="mt-1 text-sm text-slate-500">资料卡用于推荐页展示自己，动态帖用于信息流分享事情。</p>
          <div className="mt-5 grid gap-3">
            <button
              onClick={() => {
                setPublishOpen(false);
                router.push("/posts/new?type=card");
              }}
              className="rounded-2xl bg-teal-50 p-4 text-left ring-1 ring-teal-100"
            >
              <p className="text-base font-black text-teal-700">发资料卡</p>
              <p className="mt-1 text-sm text-slate-500">上传照片、介绍自己，用于今日遇见和找同频。</p>
            </button>
            <button
              onClick={() => {
                setPublishOpen(false);
                router.push("/posts/new?type=post");
              }}
              className="rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100"
            >
              <p className="text-base font-black text-slate-900">发动态帖</p>
              <p className="mt-1 text-sm text-slate-500">发布组队、机会、经验、日常和问题。</p>
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

function Tab({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href} className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 ${active ? "text-teal-700" : "text-slate-700"}`}>
      <span className="text-3xl leading-none">{icon}</span>
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 pb-8 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-300" />
        {children}
        <button onClick={onClose} className="mt-4 w-full rounded-xl py-3 text-base font-medium text-slate-500 hover:bg-slate-100">
          取消
        </button>
      </div>
    </div>
  );
}
