import Link from "next/link";

export default async function DataFeed({
  isBrowsing,
}: {
  tag?: string;
  search: string;
  isBrowsing: boolean;
}) {
  return (
    <div className="mx-auto max-w-4xl px-2 py-4 sm:px-4">
      {isBrowsing && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-pink-100 bg-pink-50 px-5 py-4 text-pink-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">你正在以游客身份浏览。登录后可以发布名片、喜欢、私信和匿名开口。</p>
          <Link href="/login" className="inline-flex justify-center rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-400">
            立即登录
          </Link>
        </div>
      )}

      <section className="min-h-[calc(100vh-8rem)] rounded-[2rem] bg-[#fff7fb] px-4 py-5 shadow-sm ring-1 ring-pink-100 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-normal text-slate-950">推荐</h1>
          <div className="flex items-center gap-3">
            <Link href="/messages" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-slate-900 shadow-sm ring-1 ring-slate-100" aria-label="消息">
              ♡
            </Link>
            <Link href="/activity" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-slate-900 shadow-sm ring-1 ring-slate-100" aria-label="筛选">
              ≡
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-pink-100">
          <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full bg-white/70 px-5 py-2 text-sm font-black text-pink-500 shadow-sm ring-1 ring-white/80 backdrop-blur">
            AI 特别推荐
          </div>

          <div className="relative min-h-[620px] bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.55),transparent_24%),radial-gradient(circle_at_70%_8%,rgba(244,114,182,0.28),transparent_30%),linear-gradient(135deg,#66d9ff_0%,#f5d9ff_45%,#f8fbff_100%)] p-6 sm:p-10">
            <div className="mt-24 flex flex-col gap-6 sm:mt-28 sm:flex-row sm:items-center">
              <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-lg ring-2 ring-white/70">
                <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_48%_30%,#fde68a_0_16%,transparent_17%),linear-gradient(135deg,#93c5fd,#fbcfe8)]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black text-white drop-shadow-sm">玉米</h2>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400 text-sm font-black text-white">✓</span>
                </div>
                <div className="mt-4 inline-flex rounded-full bg-slate-500/25 px-4 py-2 text-base font-bold text-white backdrop-blur">
                  在线 · 23 岁 · 河北农业大学
                </div>
              </div>
            </div>

            <div className="mt-28 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black text-pink-400">契合度 <span className="text-6xl text-sky-400">90%</span></p>
              </div>
              <div className="hidden -space-x-3 sm:flex">
                <div className="h-14 w-14 rounded-full bg-pink-200 ring-4 ring-white" />
                <div className="h-14 w-14 rounded-full bg-slate-300 ring-4 ring-white" />
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] bg-white/78 p-6 shadow-sm backdrop-blur">
              <p className="text-lg font-black text-slate-950">她符合你的 3 个偏好</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {["是个超爱笑女孩", "向往超市的浪漫", "超爱吃美食"].map((item) => (
                  <span key={item} className="rounded-full bg-pink-100 px-4 py-2 text-sm font-black text-pink-500">
                    ♥ {item}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-4 text-lg leading-8 text-slate-900">
                <p>“ 对生活很热爱，生活圈子简单，去年毕业，目前在家考公，超爱笑</p>
                <p>“ 想和喜欢的人一起吃吃吃，一起看很多电影，一起逛超市</p>
                <p>“ 看到好吃的就走不动路，离不开美食</p>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-[48%] flex -translate-y-1/2 flex-col gap-5 sm:right-7">
            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-xl">🌸</button>
            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-pink-500 shadow-xl">♥</button>
            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-4xl text-slate-400 shadow-xl">×</button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 rounded-[1.5rem] bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100">
          <NavPill href="/" active label="推荐" icon="★" />
          <NavPill href="/activity?search=遇见" label="喜欢" icon="♡" />
          <NavPill href="/activity" label="动态" icon="◎" />
          <NavPill href="/messages" label="消息" icon="○" />
        </div>
      </section>
    </div>
  );
}

function NavPill({ href, label, icon, active = false }: { href: string; label: string; icon: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-sm font-bold ${active ? "text-pink-500" : "text-slate-700"}`}>
      <span className="text-3xl leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
