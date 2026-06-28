"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const LIKE_KEY = "campus-dev-hub-liked-profile-cards";

export default function MeClient({
  user,
}: {
  user: { name: string; email: string; role: string; impersonating: boolean };
}) {
  const [liked, setLiked] = useState<string[]>([]);
  const isAdmin = user.role === "admin" && !user.impersonating;

  useEffect(() => {
    try {
      setLiked(JSON.parse(localStorage.getItem(LIKE_KEY) || "[]"));
    } catch {
      setLiked([]);
    }
  }, []);

  function clearLikes() {
    localStorage.removeItem(LIKE_KEY);
    setLiked([]);
  }

  const items = [
    { label: "个人资料", href: `/profile/${user.name}` },
    { label: "我的帖子", href: `/profile/${user.name}` },
    { label: "我喜欢的", href: "#liked" },
    { label: "喜欢我的", href: "#liked-me" },
    { label: "历史评论", href: `/profile/${user.name}` },
    { label: "我的收藏", href: "#liked" },
    { label: "建议反馈", href: "/messages" },
    { label: "隐私政策", href: "/premium" },
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-4 py-4 pb-24 lg:pb-6">
      <section className="rounded-[1.75rem] bg-white/78 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-black text-slate-950">{user.name}</h1>
            <p className="mt-2 truncate text-base text-slate-400">{user.email || "围炉同学"}</p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-sky-100 text-3xl font-black text-teal-700 ring-1 ring-white">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 text-left">
          <Stat value="0" label="已发帖" />
          <Stat value={String(liked.length)} label="我喜欢的" />
          <Stat value="0" label="喜欢我的" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/posts/new?type=card" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
            完善资料卡
          </Link>
          {isAdmin && (
            <Link href="/admin" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">
              管理控制台
            </Link>
          )}
        </div>
      </section>

      <Link href="/activity?tag=活动讲座" className="flex items-center justify-between rounded-2xl bg-sky-50/90 px-5 py-4 text-sky-700 ring-1 ring-sky-100">
        <span className="text-base font-bold">进学校信息流看看</span>
        <span className="text-2xl text-sky-400">›</span>
      </Link>

      <section className="rounded-[1.75rem] bg-white/78 p-3 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-medium text-slate-700 hover:bg-slate-50">
              <span>{item.label}</span>
              <span className="text-2xl text-slate-300">›</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="liked" className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/78 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-teal-700">我喜欢的</p>
            {liked.length > 0 && (
              <button onClick={clearLikes} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                清空
              </button>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {liked.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">你还没有喜欢过资料卡。</p>
            ) : (
              liked.map((id, index) => (
                <div key={id} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  资料卡 {index + 1}
                </div>
              ))
            )}
          </div>
        </div>

        <div id="liked-me" className="rounded-2xl bg-white/78 p-5 shadow-sm ring-1 ring-white/70 backdrop-blur-xl">
          <p className="text-sm font-black text-sky-700">喜欢我的</p>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">后续接入数据库后展示真实喜欢你的人。</p>
        </div>
      </section>

      <div className="pb-4 text-center">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-bold text-slate-400">
          退出登录
        </button>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}
