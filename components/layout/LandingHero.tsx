import Link from "next/link";

const floatingCards = [
  { title: "机会雷达", meta: "比赛 · 活动 · 讲座", x: "left-[8%] top-[22%]" },
  { title: "遇见同频", meta: "朋友 · 搭子 · 对象", x: "right-[10%] top-[26%]" },
  { title: "组队卡", meta: "缺前端 · 目标省奖", x: "left-[14%] bottom-[18%]" },
  { title: "校园名片", meta: "作品 · 经历 · 正在寻找", x: "right-[13%] bottom-[20%]" },
];

const sceneCards = [
  ["机会", "不再错过想做的事"],
  ["组队", "把想法变成行动"],
  ["遇见", "认识同频的人"],
  ["名片", "让优秀被看见"],
];

export default function LandingHero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#eef9f7] text-slate-950">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-students-walking-in-a-university-4510-large.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.55),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(167,243,208,0.65),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.80),rgba(240,253,250,0.96))]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

      {floatingCards.map((card, index) => (
        <div
          key={card.title}
          className={`pointer-events-none absolute hidden rounded-3xl border border-white/70 bg-white/75 px-5 py-4 shadow-xl shadow-cyan-900/10 backdrop-blur-xl lg:block ${card.x}`}
          style={{ animation: `float ${4 + index * 0.35}s ease-in-out infinite` }}
        >
          <p className="text-sm font-bold text-slate-900">{card.title}</p>
          <p className="mt-1 text-xs text-slate-500">{card.meta}</p>
        </div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm backdrop-blur">
          围炉 · 校园机会与同频社区
        </div>
        <h1 className="mt-7 text-6xl font-black tracking-normal text-slate-950 sm:text-7xl lg:text-8xl">
          围炉
        </h1>
        <p className="mt-5 text-2xl font-semibold text-slate-800 sm:text-3xl">
          发现机会，遇见同频的人
        </p>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          别让信息差挡住你想做的事，也别让有趣的你停在人海里。
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/?browse=1"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95"
          >
            进入围炉
          </Link>
          <Link
            href="/posts/new"
            className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/80 px-8 py-3.5 text-base font-bold text-slate-900 shadow-lg shadow-cyan-900/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
          >
            发布一个想法
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {sceneCards.map(([title, desc]) => (
            <div key={title} className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-lg font-black text-slate-950">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
