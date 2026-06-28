"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LIKE_KEY = "campus-dev-hub-liked-profile-cards";

export default function LikedClient() {
  const [liked, setLiked] = useState<string[]>([]);

  useEffect(() => {
    try {
      setLiked(JSON.parse(localStorage.getItem(LIKE_KEY) || "[]"));
    } catch {
      setLiked([]);
    }
  }, []);

  function clear() {
    localStorage.removeItem(LIKE_KEY);
    setLiked([]);
  }

  return (
    <main className="mx-auto max-w-3xl py-5 pb-24 lg:pb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-teal-700">我的</p>
          <h1 className="text-3xl font-black text-slate-950">我喜欢的</h1>
        </div>
        {liked.length > 0 && (
          <button onClick={clear} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
            清空
          </button>
        )}
      </div>
      <section className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur">
        {liked.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-600">你还没有喜欢过资料卡。</p>
            <Link href="/" className="mt-4 inline-flex rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white">
              去推荐页看看
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {liked.map((id, index) => (
              <div key={id} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                资料卡 {index + 1}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
