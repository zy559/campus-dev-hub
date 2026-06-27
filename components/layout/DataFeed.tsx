"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const cards = [
  {
    name: "玉米",
    meta: "23 岁 · 河北农业大学",
    online: true,
    match: 90,
    needs: ["找饭搭子", "找对象", "一起看电影"],
    interests: ["美食", "超市散步", "电影", "爱笑"],
    intro: "对生活很热爱，生活圈子简单。想认识能一起吃饭、看电影、逛校园的人，也可以先轻松聊聊。",
    gradients: ["from-sky-200 via-pink-100 to-white", "from-amber-100 via-rose-100 to-white", "from-teal-100 via-cyan-100 to-white"],
  },
  {
    name: "林同学",
    meta: "大三 · 计算机",
    online: true,
    match: 86,
    needs: ["找比赛队友", "找自习搭子", "项目搭子"],
    interests: ["前端", "羽毛球", "摄影", "数学建模"],
    intro: "最近想做一个校园小项目，也在准备比赛。希望找到认真但不内耗的队友，一起推进事情。",
    gradients: ["from-teal-200 via-cyan-100 to-white", "from-indigo-100 via-sky-100 to-white", "from-emerald-100 via-teal-50 to-white"],
  },
];

export default function DataFeed({ isBrowsing }: { tag?: string; search: string; isBrowsing: boolean }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const card = cards[cardIndex % cards.length];
  const opener = useMemo(() => `你好，我看到你的资料卡，感觉我们都对${card.interests.slice(0, 2).join("、")}感兴趣，可以认识一下吗？`, [card]);

  function nextCard() {
    setCardIndex((value) => (value + 1) % cards.length);
    setImageIndex(0);
  }

  return (
    <div className="mx-auto max-w-4xl px-2 py-4 sm:px-4">
      {isBrowsing && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-pink-100 bg-pink-50 px-5 py-4 text-pink-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">你正在以游客身份浏览。登录后可以发布资料卡、喜欢、聊天和匿名开口。</p>
          <Link href="/login" className="inline-flex justify-center rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-400">
            立即登录
          </Link>
        </div>
      )}

      <section className="min-h-[calc(100vh-8rem)] rounded-[2rem] bg-[#fff7fb] px-4 py-5 shadow-sm ring-1 ring-pink-100 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-normal text-slate-950">推荐</h1>
          <div className="flex items-center gap-3">
            <Link href="/messages" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100">
              聊天
            </Link>
            <Link href="/activity" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100">
              动态
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-pink-100">
          <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full bg-white/75 px-5 py-2 text-sm font-black text-pink-500 shadow-sm ring-1 ring-white/80 backdrop-blur">
            AI 特别推荐
          </div>

          <div className={`relative min-h-[650px] bg-gradient-to-br ${card.gradients[imageIndex]} p-5 sm:p-8`}>
            <div className="mt-16 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-white shadow-lg ring-1 ring-white/80">
                  <div className={`h-full w-full bg-gradient-to-br ${card.gradients[imageIndex]}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_22%,rgba(255,255,255,0.95),transparent_18%),radial-gradient(circle_at_58%_42%,rgba(255,255,255,0.45),transparent_16%),radial-gradient(circle_at_50%_76%,rgba(236,72,153,0.18),transparent_30%)]" />
                  </div>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  {card.gradients.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImageIndex(index)}
                      className={`h-2.5 rounded-full transition ${imageIndex === index ? "w-7 bg-pink-500" : "w-2.5 bg-white ring-1 ring-pink-100"}`}
                      aria-label={`切换第 ${index + 1} 张图片`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white/82 p-5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-black text-slate-950">{card.name}</h2>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400 text-sm font-black text-white">✓</span>
                    </div>
                    <p className="mt-2 rounded-full bg-slate-500/10 px-3 py-1 text-sm font-bold text-slate-600">
                      {card.online ? "在线 · " : ""}{card.meta}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-pink-400">契合度</p>
                    <p className="text-4xl font-black text-sky-400">{card.match}%</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-black text-slate-950">TA 想找</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.needs.map((need) => (
                      <span key={need} className="rounded-full bg-pink-100 px-3 py-1.5 text-sm font-black text-pink-500">
                        ♥ {need}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-black text-slate-950">兴趣</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.interests.map((interest) => (
                      <span key={interest} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-6 text-base leading-8 text-slate-900">“ {card.intro}</p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <button onClick={nextCard} className="rounded-full border border-slate-200 bg-white py-3 text-sm font-black text-slate-500">
                    跳过
                  </button>
                  <button onClick={nextCard} className="rounded-full bg-pink-500 py-3 text-sm font-black text-white">
                    喜欢
                  </button>
                  <Link href={`/messages?opener=${encodeURIComponent(opener)}`} className="rounded-full bg-slate-950 py-3 text-center text-sm font-black text-white">
                    聊天
                  </Link>
                </div>
                <Link href={`/messages?opener=${encodeURIComponent("我想先匿名了解一下你的资料卡，可以聊聊吗？")}`} className="mt-3 block text-center text-sm font-bold text-pink-500">
                  匿名开口
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
