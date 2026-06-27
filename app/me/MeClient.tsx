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

  return (
    <main className="space-y-4 py-3 pb-24 lg:pb-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xl font-black text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black text-slate-950">{user.name}</h1>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
            退出
          </button>
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-2xl bg-slate-950 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-teal-300">管理员</p>
              <h2 className="mt-1 text-2xl font-black text-white">控制台</h2>
              <p className="mt-2 text-sm text-slate-300">手机端也可以从这里进入数据监控和用户治理。</p>
            </div>
            <Link href="/admin" className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-black text-white">
              进入
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-teal-700">我喜欢的</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">{liked.length}</h2>
            </div>
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
          <Link href="/" className="mt-4 inline-flex rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white">
            继续推荐
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-black text-sky-700">喜欢我的</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">0</h2>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            这里先预留入口。当前喜欢数据保存在本机，后续接入数据库后可以展示真实喜欢你的人。
          </p>
          <Link href="/posts/new?type=card" className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
            完善资料卡
          </Link>
        </div>
      </section>
    </main>
  );
}
