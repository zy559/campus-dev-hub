import Link from "next/link";

const features = [
  ["机会雷达", "比赛、活动、讲座、招募，不再靠偶然刷到。"],
  ["同频卡片", "找朋友、搭子、队友，也可以认真找对象。"],
  ["组队广场", "目标、角色、时间说清楚，合适的人更容易加入。"],
  ["个人展示", "作品、经历、标签和正在寻找，让优秀被看见。"],
];

const meetCards = [
  ["找队友", "蓝桥杯缺前端", "算法 / 前端 / 省奖"],
  ["找搭子", "今晚图书馆自习", "考研 / 打卡 / 自律"],
  ["找对象", "想认真认识一个人", "慢热 / 摄影 / 羽毛球"],
];

export default function LandingShowcase() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-teal-600">围炉的特色</p>
          <h2 className="mt-3 text-4xl font-black tracking-normal text-slate-950 sm:text-5xl">
            让校园信息变得好找。
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            把人、机会和想法重新整理，让每个同学都更容易开始。
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, desc]) => (
            <div key={title} className="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-6">
              <h3 className="text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-bold text-teal-600">遇见同频的人</p>
            <h2 className="mt-3 text-4xl font-black tracking-normal text-slate-950 sm:text-5xl">
              从一张校园名片开始。
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-500">
              用兴趣、目标、作品和正在寻找，替代杂乱水贴。喜欢就收藏，想聊就开口。
            </p>
            <Link
              href="/?browse=1"
              className="mt-8 inline-flex rounded-full bg-slate-950 px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              体验今日遇见
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative h-[420px]">
              {meetCards.map(([mode, title, tags], index) => (
                <div
                  key={mode}
                  className="absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white bg-white/90 p-5 shadow-2xl shadow-slate-200 backdrop-blur"
                  style={{
                    transform: `translate(-50%, -50%) translate(${(index - 1) * 22}px, ${index * 18}px) rotate(${(index - 1) * 5}deg)`,
                    zIndex: 10 - index,
                  }}
                >
                  <div className="h-40 rounded-[1.4rem] bg-gradient-to-br from-white via-teal-50 to-sky-100" />
                  <span className="mt-5 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                    {mode}
                  </span>
                  <h3 className="mt-3 text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{tags}</p>
                  <div className="mt-5 flex gap-3">
                    <button className="flex-1 rounded-full border border-slate-200 py-2 text-sm font-bold text-slate-500">
                      跳过
                    </button>
                    <button className="flex-1 rounded-full bg-teal-600 py-2 text-sm font-bold text-white">
                      感兴趣
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
