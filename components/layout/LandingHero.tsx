import Link from "next/link";
import ScrollRow from "@/components/ui/ScrollRow";

// Unsplash 图片 — 小尺寸优化
const IMG = {
  algo: "https://images.unsplash.com/photo-1504639725591-34d0984388bd?w=400&q=75",
  web: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=75",
  backend: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=75",
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=75",
  os: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=75",
  project: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=75",
  interview: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=75",
  notes: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=75",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=75",
  sports: "https://images.unsplash.com/photo-1461896836934-bd45ba882cf1?w=400&q=75",
  gaming: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=75",
  photo: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=400&q=75",
  movie: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=75",
  chat: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=75",
  event: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=75",
  market: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=75",
};

// 话题卡片数据（纯静态）
const topicCards = [
  { id: "algo", img: IMG.algo, icon: "🧠", title: "算法与数据结构", description: "LeetCode 题解、竞赛总结、面试高频题型" },
  { id: "web", img: IMG.web, icon: "🌐", title: "前端开发", description: "React、Vue、CSS 技巧与项目实战" },
  { id: "be", img: IMG.backend, icon: "⚙️", title: "后端架构", description: "Go、Java、数据库设计与系统设计" },
  { id: "ai", img: IMG.ai, icon: "🤖", title: "AI & 机器学习", description: "深度学习、NLP、CV 论文解读与实践" },
  { id: "os", img: IMG.os, icon: "💾", title: "操作系统", description: "Linux 内核、进程调度、内存管理" },
  { id: "proj", img: IMG.project, icon: "🚀", title: "项目实战", description: "课设展示、开源贡献、Hackathon 作品" },
  { id: "intv", img: IMG.interview, icon: "💼", title: "面试经验", description: "大厂面经、实习攻略、简历优化" },
  { id: "notes", img: IMG.notes, icon: "📖", title: "学习笔记", description: "课程总结、考试复习、知识体系梳理" },
];

const dailyTopicCards = [
  { id: "food", img: IMG.food, icon: "🍜", title: "美食推荐", description: "食堂探店、外卖测评、周边美食推荐" },
  { id: "sports", img: IMG.sports, icon: "🏀", title: "运动健身", description: "约球组队、跑步打卡、健身房交流" },
  { id: "gaming", img: IMG.gaming, icon: "🎮", title: "游戏娱乐", description: "开黑组队、游戏攻略、赛事讨论" },
  { id: "photo", img: IMG.photo, icon: "📸", title: "摄影随拍", description: "校园风景、日常记录、手机摄影" },
  { id: "movie", img: IMG.movie, icon: "🎬", title: "影视音乐", description: "电影推荐、追番讨论、歌单分享" },
  { id: "chat", img: IMG.chat, icon: "💬", title: "心情杂谈", description: "吐槽专区、树洞、心情随笔" },
  { id: "event", img: IMG.event, icon: "🎉", title: "活动聚会", description: "社团活动、线下聚会、志愿者招募" },
  { id: "market", img: IMG.market, icon: "🛒", title: "二手好物", description: "闲置转卖、求购、好物推荐" },
];

/** Clip-path 光晕组件 */
function Glow({ className, from, to }: { className?: string; from: string; to: string }) {
  return (
    <div aria-hidden="true" className={`absolute -z-10 transform-gpu overflow-hidden blur-3xl ${className ?? ""}`}>
      <div
        style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
        className={`aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr ${from} ${to} opacity-20 sm:w-[72.1875rem]`}
      />
    </div>
  );
}

// ============== 纯静态组件 — 零 DB 查询，瞬间渲染 ==============
export default function LandingHero() {
  return (
    <div className="bg-slate-950">
      {/* ========== Section 1: Hero — 深色大屏 ========== */}
      <div className="relative isolate overflow-hidden">
        <Glow
          className="inset-x-0 -top-40 sm:-top-80"
          from="from-amber-500" to="to-orange-400"
        />
        <Glow
          className="inset-x-0 top-[calc(100%-13rem)] sm:top-[calc(100%-30rem)] left-[50%] translate-x-[-50%]"
          from="from-amber-500" to="to-orange-400"
        />
        <div aria-hidden="true" className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] -z-10" />
        <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-400/8 blur-[120px] -z-10" />

        <section className="relative min-h-[90vh] flex items-center">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:py-40">
            <div className="flex justify-center mb-8">
              <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-400 ring-1 ring-white/10 hover:ring-white/20 transition-all">
                🎓 计算机系同学的专属社区
                <Link href="/?browse=1" className="font-semibold text-amber-400 ml-1.5">
                  开始探索 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-7xl">
                技术有温度
              </h1>
              <p className="mt-6 text-pretty text-xl font-medium text-amber-400 sm:text-2xl">
                写代码，也写日常
              </p>
              <p className="mt-8 text-pretty text-lg font-medium text-slate-400 sm:text-xl/8 max-w-2xl mx-auto">
                用 Markdown 写技术文章，和全校同学讨论课程与项目。<br className="hidden sm:block" />
                一个人的笔记，全年级的力量。
              </p>

              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/?browse=1"
                  className="rounded-full bg-amber-500 px-8 py-3.5 text-base font-semibold text-slate-950 shadow-sm hover:bg-amber-400 transition-all duration-200 active:scale-95"
                >
                  免费开始使用
                </Link>
                <a
                  href="#showcase"
                  className="text-base font-semibold leading-6 text-white hover:text-amber-300 transition-colors"
                >
                  了解更多 <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="mt-16 flex items-center justify-center gap-x-8 sm:gap-x-12">
                {[
                  ["📝", "分享知识"],
                  ["👥", "找到队友"],
                  ["🎓", "面向全校同学"],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-3 rounded-full bg-white/40 animate-pulse" />
            </div>
          </div>
        </section>
      </div>

      {/* ========== Section 2: 话题滚动 — 深色背景 ========== */}
      <section id="showcase" className="py-24 sm:py-32 overflow-hidden border-t border-white/5">
        {/* 技术学习 */}
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 mb-3">
              📚 学习知识
            </span>
            <h2 className="text-3xl font-bold text-white mb-2">探索你感兴趣的话题</h2>
            <p className="text-slate-400">左右滑动查看更多，每周都有新内容</p>
          </div>
        </div>
        <ScrollRow cards={topicCards} speed={25} />

        {/* 分享日常 */}
        <div className="max-w-6xl mx-auto px-6 mb-6 mt-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 mb-3">
              📋 分享日常
            </span>
            <h2 className="text-3xl font-bold text-white mb-2">不只是技术，还有生活</h2>
            <p className="text-slate-400">美食、运动、游戏、摄影——和全校同学分享校园日常</p>
          </div>
        </div>
        <ScrollRow cards={dailyTopicCards} speed={22} />
      </section>

      {/* ========== Section 3: Features — 4 项 2 列 ========== */}
      <div className="py-24 sm:py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold text-amber-400">为什么选择围炉</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl lg:text-balance">
              你需要的，我们都准备好了
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              从技术写作到社区互动，从组队比赛到分享日常——围炉为计算机系同学量身打造。
            </p>
          </div>

          <dl className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {[
              {
                name: "Markdown 技术写作",
                desc: "GitHub 风格 Markdown，语法高亮、数学公式、表格、流程图——写技术文章就像写代码一样自然。",
                icon: <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />,
              },
              {
                name: "板块分区 + 标签筛选",
                desc: "学习知识、分享日常、寻找比赛、综合讨论——内容分区分明，标签一筛即达，不迷路。",
                icon: (
                  <>
                    <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path d="M6 6h.008v.008H6V6Z" />
                  </>
                ),
              },
              {
                name: "找到你的项目队友",
                desc: "打比赛、做课设、刷题打卡——发布组队帖，找到志同道合的同学，让团队协作事半功倍。",
                icon: <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />,
              },
              {
                name: "私信聊天 · 实时沟通",
                desc: "看见感兴趣的同学？直接发起一对一私信。不用加微信就能聊项目、约比赛、交朋友。",
                icon: <path d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />,
              },
            ].map((f) => (
              <div key={f.name} className="relative pl-16">
                <dt className="text-base font-semibold text-white">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-amber-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" className="size-6 text-slate-950">
                      {f.icon}
                    </svg>
                  </div>
                  {f.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-400">{f.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ========== Section 4: CTA ========== */}
      <section className="py-28 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            准备好加入了吗？
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
            免费注册，开始分享你的第一篇技术文章。和全校同学一起，打造属于我们的技术社区。
          </p>
          <Link
            href="/?browse=1"
            className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-10 py-4 rounded-full hover:bg-amber-400 transition-all duration-200 font-bold text-base active:scale-95"
          >
            立即加入
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
