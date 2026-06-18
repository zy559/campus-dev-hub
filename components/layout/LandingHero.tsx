import Link from "next/link";
import ScrollRow from "@/components/ui/ScrollRow";

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400&q=75`;

const IMG = {
  algo:    pexels(3861969),
  web:     pexels(326503),
  backend: pexels(1181271),
  ai:      pexels(8386440),
  os:      pexels(546819),
  project: pexels(3183153),
  intervw: pexels(4348404),
  notes:   pexels(4144923),
  food:    pexels(1640777),
  sports:  pexels(1752757),
  gaming:  pexels(7915357),
  photo:   pexels(212324),
  movie:   pexels(274937),
  chat:    pexels(614810),
  event:   pexels(1190297),
  market:  pexels(4246074),
};

const topicCards = [
  { id: "algo", img: IMG.algo, icon: "🧠", title: "算法", description: "LeetCode 题解、竞赛、面试高频题型" },
  { id: "web",  img: IMG.web,  icon: "🌐", title: "前端", description: "React、Vue、CSS 与项目实战" },
  { id: "be",   img: IMG.backend, icon: "⚙️", title: "后端", description: "Go、Java、数据库与系统设计" },
  { id: "ai",   img: IMG.ai,   icon: "🤖", title: "AI",  description: "深度学习、NLP、CV 论文与实践" },
  { id: "os",   img: IMG.os,   icon: "💾", title: "系统", description: "Linux 内核、进程调度、内存管理" },
  { id: "proj", img: IMG.project, icon: "🚀", title: "实战", description: "课设展示、Hackathon 作品" },
  { id: "intv", img: IMG.intervw, icon: "💼", title: "面试", description: "大厂面经、实习攻略、简历优化" },
  { id: "notes", img: IMG.notes, icon: "📖", title: "笔记", description: "课程总结、考试复习、知识梳理" },
];

const dailyTopicCards = [
  { id: "food",   img: IMG.food,   icon: "🍜", title: "美食", description: "食堂探店、外卖测评" },
  { id: "sports", img: IMG.sports, icon: "🏀", title: "运动", description: "约球组队、跑步打卡" },
  { id: "gaming", img: IMG.gaming, icon: "🎮", title: "游戏", description: "开黑组队、攻略讨论" },
  { id: "photo",  img: IMG.photo,  icon: "📸", title: "摄影", description: "校园风景、日常记录" },
  { id: "movie",  img: IMG.movie,  icon: "🎬", title: "影视", description: "电影推荐、歌单分享" },
  { id: "chat",   img: IMG.chat,   icon: "💬", title: "心情", description: "吐槽专区、心情随笔" },
  { id: "event",  img: IMG.event,  icon: "🎉", title: "活动", description: "社团活动、聚会招募" },
  { id: "market", img: IMG.market, icon: "🛒", title: "好物", description: "闲置转卖、好物推荐" },
];

const features = [
  {
    icon: <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" />,
    title: "Markdown 技术写作",
    desc: "GitHub 风格 Markdown — 语法高亮、数学公式、表格、流程图。写技术文章就像写代码一样自然。",
  },
  {
    icon: <><path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path d="M6 6h.008v.008H6V6Z" /></>,
    title: "板块分区 + 标签筛选",
    desc: "四大主板块、十五个技术标签。内容分区分明，搜什么都能找到。",
  },
  {
    icon: <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" strokeLinecap="round" strokeLinejoin="round" />,
    title: "找到你的项目队友",
    desc: "打比赛、做课设、刷题打卡——发布组队帖，找到志同道合的同学。",
  },
  {
    icon: <path d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" strokeLinecap="round" strokeLinejoin="round" />,
    title: "私信聊天 · 实时沟通",
    desc: "不用加微信就能一对一聊天。聊项目、约比赛、交朋友，全在围炉。",
  },
];

export default function LandingHero() {
  return (
    <>
      {/* ========== Section 1: Hero — Apple 亮色 + dark: 暗色 ========== */}
      <section className="relative isolate overflow-hidden bg-white dark:bg-slate-950 min-h-[90vh] flex items-center">
        {/* 亮色光斑 */}
        <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-amber-500/[0.06] blur-[120px] dark:bg-amber-500/10 dark:blur-[100px] -z-10" />
        <div aria-hidden="true" className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-orange-400/[0.04] blur-[100px] dark:bg-orange-400/8 -z-10" />

        <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm">
                🎓 计算机系同学的专属社区
              </span>
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
              技术有温度
            </h1>
            <p className="mt-5 text-xl font-medium text-amber-500 sm:text-2xl">
              写代码，也写日常
            </p>
            <p className="mt-6 text-lg leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xl max-w-2xl mx-auto">
              用 Markdown 写技术文章，和全校同学讨论课程与项目。<br className="hidden sm:block" />
              一个人的笔记，全年级的力量。
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-5">
              <Link
                href="/?browse=1"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 dark:shadow-amber-500/25 transition-all duration-200 active:scale-95"
              >
                免费开始使用
              </Link>
              <a
                href="#philosophy"
                className="text-base font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-amber-300 transition-colors"
              >
                了解更多 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* 滚动指示器 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-slate-400 dark:bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ========== Section 2: 话题滑动 — 纯白底亮色 + dark: 深色 ========== */}
      <section id="philosophy" className="py-24 sm:py-32 overflow-hidden bg-[#FAFAFA] dark:bg-slate-950 border-t border-slate-200/60 dark:border-white/5">
        {/* 学习 */}
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20 mb-4">
              📚 学习知识
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              探索你感兴趣的话题
            </h2>
            <p className="text-slate-500 dark:text-slate-400">左右滑动查看全部话题</p>
          </div>
        </div>
        <ScrollRow cards={topicCards} speed={25} />

        {/* 日常 */}
        <div className="max-w-6xl mx-auto px-6 mb-6 mt-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 ring-1 ring-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20 mb-4">
              📋 分享日常
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              不只是技术，还有生活
            </h2>
            <p className="text-slate-500 dark:text-slate-400">美食、运动、摄影——和全校同学分享</p>
          </div>
        </div>
        <ScrollRow cards={dailyTopicCards} speed={22} />
      </section>

      {/* ========== Section 3: Features ========== */}
      <section className="py-24 sm:py-32 bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-amber-400">
              为什么选择围炉
            </h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              你需要的，我们都准备好了
            </p>
            <p className="mt-6 text-lg text-slate-500 dark:text-slate-400">
              从技术写作到社区互动，从组队比赛到分享日常——围炉为计算机系同学量身打造。
            </p>
          </div>

          <dl className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2 lg:gap-y-16">
            {features.map((f) => (
              <div key={f.title} className="relative pl-16">
                <dt className="text-base font-semibold text-slate-900 dark:text-white">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-xl bg-blue-600 dark:bg-amber-500 shadow-sm shadow-blue-600/20 dark:shadow-amber-500/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="size-6 text-white dark:text-slate-950">
                      {f.icon}
                    </svg>
                  </div>
                  {f.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">{f.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ========== Section 4: CTA ========== */}
      <section className="py-28 px-6 bg-[#FAFAFA] dark:bg-slate-950 border-t border-slate-200/60 dark:border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            准备好加入了吗？
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto">
            免费注册，开始分享你的第一篇技术文章。和全校同学一起，打造属于我们的技术社区。
          </p>
          <Link
            href="/?browse=1"
            className="inline-flex items-center gap-2 bg-blue-600 text-white dark:bg-amber-500 dark:text-slate-950 px-10 py-4 rounded-full hover:bg-blue-700 dark:hover:bg-amber-400 transition-all duration-200 font-bold text-base shadow-lg shadow-blue-600/20 dark:shadow-amber-500/25 active:scale-95"
          >
            立即加入
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
