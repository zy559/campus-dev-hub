import Link from "next/link";
import ScrollRow from "@/components/ui/ScrollRow";

// 话题卡片数据（纯静态）
const topicCards = [
  { id: "algo", icon: "🧠", title: "算法与数据结构", description: "LeetCode 题解、竞赛总结、面试高频题型" },
  { id: "web", icon: "🌐", title: "前端开发", description: "React、Vue、CSS 技巧与项目实战" },
  { id: "be", icon: "⚙️", title: "后端架构", description: "Go、Java、数据库设计与系统设计" },
  { id: "ai", icon: "🤖", title: "AI & 机器学习", description: "深度学习、NLP、CV 论文解读与实践" },
  { id: "os", icon: "💾", title: "操作系统", description: "Linux 内核、进程调度、内存管理" },
  { id: "proj", icon: "🚀", title: "项目实战", description: "课设展示、开源贡献、Hackathon 作品" },
  { id: "intv", icon: "💼", title: "面试经验", description: "大厂面经、实习攻略、简历优化" },
  { id: "notes", icon: "📖", title: "学习笔记", description: "课程总结、考试复习、知识体系梳理" },
];

const dailyTopicCards = [
  { id: "food", icon: "🍜", title: "美食推荐", description: "食堂探店、外卖测评、周边美食推荐" },
  { id: "sports", icon: "🏀", title: "运动健身", description: "约球组队、跑步打卡、健身房交流" },
  { id: "gaming", icon: "🎮", title: "游戏娱乐", description: "开黑组队、游戏攻略、赛事讨论" },
  { id: "photo", icon: "📸", title: "摄影随拍", description: "校园风景、日常记录、手机摄影" },
  { id: "movie", icon: "🎬", title: "影视音乐", description: "电影推荐、追番讨论、歌单分享" },
  { id: "chat", icon: "💬", title: "心情杂谈", description: "吐槽专区、树洞、心情随笔" },
  { id: "event", icon: "🎉", title: "活动聚会", description: "社团活动、线下聚会、志愿者招募" },
  { id: "market", icon: "🛒", title: "二手好物", description: "闲置转卖、求购、好物推荐" },
];

// 深色背景主题 — 暖橙色基调，Tailwind Plus 风格
export default function LandingHero() {
  return (
    <>
      {/* ========== Section 1: Hero — 深色大屏 ========== */}
      <div className="relative isolate overflow-hidden bg-slate-950">
        {/* 顶部渐变光晕 */}
        <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-amber-500 to-orange-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* 底部渐变光晕 */}
        <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-amber-500 to-orange-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* 小光斑 */}
        <div aria-hidden="true" className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] -z-10" />
        <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-400/8 blur-[120px] -z-10" />

        <section className="relative min-h-[92vh] flex items-center">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:py-40">
            {/* 公告 badge */}
            <div className="flex justify-center mb-8">
              <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-400 ring-1 ring-white/10 hover:ring-white/20 transition-all">
                🎓 计算机系同学的专属社区
                <Link href="/?browse=1" className="font-semibold text-amber-400 ml-1.5">
                  开始探索 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* 主标题 */}
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

              {/* CTA 按钮 */}
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/?browse=1"
                  className="rounded-full bg-amber-500 px-8 py-3.5 text-base font-semibold text-slate-950 shadow-sm hover:bg-amber-400 transition-all duration-200 active:scale-95"
                >
                  免费开始使用
                </Link>
                <a
                  href="#topics"
                  className="text-base font-semibold leading-6 text-white hover:text-amber-300 transition-colors"
                >
                  了解更多 <span aria-hidden="true">→</span>
                </a>
              </div>

              {/* 底部数据点 */}
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

          {/* 底部滚动指示器 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-3 rounded-full bg-white/40 animate-pulse" />
            </div>
          </div>
        </section>
      </div>

      {/* ========== Section 2: 话题滚动 ========== */}
      <div id="topics" className="bg-white">
        <section className="py-20 overflow-hidden">
          {/* 技术学习 */}
          <div className="max-w-6xl mx-auto px-6 mb-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 mb-3">
                📚 学习知识
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">探索你感兴趣的话题</h2>
              <p className="text-slate-500">左右滑动查看更多，每周都有新内容</p>
            </div>
          </div>
          <ScrollRow cards={topicCards} speed={25} />

          {/* 分享日常 */}
          <div className="max-w-6xl mx-auto px-6 mb-6 mt-16">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-orange-50 text-orange-600 ring-1 ring-orange-200/50 mb-3">
                📋 分享日常
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">不只是技术，还有生活</h2>
              <p className="text-slate-500">美食、运动、游戏、摄影——和全校同学分享校园日常</p>
            </div>
          </div>
          <ScrollRow cards={dailyTopicCards} speed={22} />
        </section>

        {/* ========== Section 3: Feature ========== */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto space-y-28">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 mb-4 tracking-wide">
                  技术写作
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  GitHub 风格 Markdown，代码高亮零延迟
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  从课程笔记到技术博客，从算法题解到项目文档。支持语法高亮、表格、数学公式、流程图——一切你需要的写作能力。
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                  <span className="text-6xl">📝</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 mb-4 tracking-wide">
                  社区互动
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  不只是浏览，更是参与
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  评论讨论、标签筛选、个人主页……每个同学都有自己的技术名片。从课程心得到面试总结，沉淀的不只是信息，是校园技术记忆。
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center">
                  <span className="text-6xl">👥</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== Section 4: CTA ========== */}
        <section className="py-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative isolate overflow-hidden rounded-3xl bg-slate-900 p-12 sm:p-16">
              <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div
                  style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
                  className="relative left-1/2 -translate-x-1/2 aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-amber-500 to-orange-400 opacity-20 sm:w-[72.1875rem]"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative">
                准备好加入了吗？
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto relative">
                免费注册，开始分享你的第一篇技术文章。和全校同学一起，打造属于我们的技术社区。
              </p>
              <Link
                href="/?browse=1"
                className="relative inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-10 py-4 rounded-full hover:bg-amber-400 transition-all duration-200 font-bold text-base active:scale-95"
              >
                立即加入
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
