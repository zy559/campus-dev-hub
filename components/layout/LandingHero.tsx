import Link from "next/link";
import AutoCarousel from "@/components/ui/AutoCarousel";
import ScrollRow from "@/components/ui/ScrollRow";

const IMG = {
  heroBg: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&q=80",
  carousel: [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=900&q=80",
  ],
  topics: {
    algo: "https://images.unsplash.com/photo-1504639725591-34d0984388bd?w=600&q=80",
    web: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
    backend: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    os: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
    project: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
    interview: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    notes: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80",
  },
};

const heroSlides = [
  { id: "1", img: IMG.carousel[0], title: "📝 用 Markdown 分享技术", description: "代码高亮 · 表格支持 · 图片嵌入。写技术文章就像写代码一样自然。", link: "/?browse=1" },
  { id: "2", img: IMG.carousel[1], title: "👥 找到你的项目队友", description: "刷题、做课设、打比赛——好的队友让学习事半功倍。", link: "/?browse=1" },
  { id: "3", img: IMG.carousel[2], title: "📚 沉淀校园技术记忆", description: "课程心得、面试总结、项目展示——每个帖子都是真实经验。", link: "/?browse=1" },
];

const topicCards = [
  { id: "algo", img: IMG.topics.algo, icon: "🧠", title: "算法与数据结构", description: "LeetCode 题解、竞赛总结、面试高频题型" },
  { id: "web", img: IMG.topics.web, icon: "🌐", title: "前端开发", description: "React、Vue、CSS 技巧与项目实战" },
  { id: "be", img: IMG.topics.backend, icon: "⚙️", title: "后端架构", description: "Go、Java、数据库设计与系统设计" },
  { id: "ai", img: IMG.topics.ai, icon: "🤖", title: "AI & 机器学习", description: "深度学习、NLP、CV 论文解读与实践" },
  { id: "os", img: IMG.topics.os, icon: "💾", title: "操作系统", description: "Linux 内核、进程调度、内存管理" },
  { id: "proj", img: IMG.topics.project, icon: "🚀", title: "项目实战", description: "课设展示、开源贡献、Hackathon 作品" },
  { id: "intv", img: IMG.topics.interview, icon: "💼", title: "面试经验", description: "大厂面经、实习攻略、简历优化" },
  { id: "notes", img: IMG.topics.notes, icon: "📖", title: "学习笔记", description: "课程总结、考试复习、知识体系梳理" },
];

// 纯静态组件 — 零数据库查询，瞬间渲染
export default function LandingHero() {
  return (
    <div>
      {/* Section 1: Hero */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-20" aria-hidden="true">
          <img src={IMG.heroBg} alt="" className="w-full h-full object-cover opacity-30" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/50 to-surface" />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-subtle/60 via-transparent to-accent-soft/30" />
        </div>

        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px] animate-blob" />
          <div className="absolute bottom-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px] animate-blob" style={{ animationDelay: "-10s" }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 w-full py-20 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-surface/80 backdrop-blur-sm text-accent border border-accent-subtle mb-6">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
                  计算机系同学的专属社区
                </span>
              </div>

              <h1 className="animate-fade-in-up stagger-1 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink mb-5 tracking-tight leading-[1.08] text-balance">
                分享知识<br /><span className="text-accent">找到队友</span>
              </h1>

              <p className="animate-fade-in-up stagger-2 text-lg text-muted mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                用 Markdown 写技术文章，和全校同学讨论课程与项目。一个人的笔记，全年级的力量。
              </p>

              <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/?browse=1" className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-full hover:bg-accent-hover transition-all duration-200 font-semibold text-base hover:shadow-2xl hover:shadow-accent/35 active:scale-95">
                  免费开始使用
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <a href="#carousel" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-border hover:border-accent/30 transition-all duration-200 font-semibold text-ink bg-surface/70 backdrop-blur-sm active:scale-95">
                  了解更多
                </a>
              </div>

              <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-6 sm:gap-8 mt-10 justify-center lg:justify-start text-sm text-muted">
                <span>📝 分享知识</span>
                <span>👥 找到队友</span>
                <span>🎓 面向全校同学</span>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl animate-scale-in stagger-3">
              <AutoCarousel slides={heroSlides} interval={4500} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float" aria-hidden="true">
          <div className="w-6 h-10 rounded-full border-2 border-subtle flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-subtle animate-pulse-soft" />
          </div>
        </div>
      </section>

      {/* Section 2: 话题滚动 */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink mb-3">探索你感兴趣的话题</h2>
            <p className="text-muted">左右滑动查看更多，每周都有新内容</p>
          </div>
        </div>
        <ScrollRow cards={topicCards} speed={25} />
      </section>

      {/* Section 3: Feature showcase */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto space-y-28">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent mb-4 tracking-wide">技术写作</span>
              <h3 className="text-2xl font-bold text-ink mb-3">GitHub 风格 Markdown，代码高亮零延迟</h3>
              <p className="text-muted leading-relaxed">从课程笔记到技术博客，从算法题解到项目文档。支持语法高亮、表格、数学公式、流程图——一切你需要的写作能力。</p>
            </div>
            <div className="flex-1 flex justify-center">
              <img src={IMG.carousel[0]} alt="" className="w-full max-w-md rounded-2xl shadow-xl object-cover aspect-[4/3]" loading="lazy" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent mb-4 tracking-wide">社区互动</span>
              <h3 className="text-2xl font-bold text-ink mb-3">不只是浏览，更是参与</h3>
              <p className="text-muted leading-relaxed">评论讨论、标签筛选、个人主页……每个同学都有自己的技术名片。从课程心得到面试总结，沉淀的不只是信息，是校园技术记忆。</p>
            </div>
            <div className="flex-1 flex justify-center">
              <img src={IMG.carousel[1]} alt="" className="w-full max-w-md rounded-2xl shadow-xl object-cover aspect-[4/3]" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 shadow-2xl" style={{ background: "var(--cta-gradient)" }}>
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute bottom-[-30px] left-[-30px] w-60 h-60 rounded-full bg-white/8" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 relative">准备好加入了吗？</h2>
            <p className="text-white/75 text-lg mb-10 max-w-md mx-auto relative">免费注册，开始分享你的第一篇技术文章。和全校同学一起，打造属于我们的技术社区。</p>
            <Link href="/?browse=1" className="relative inline-flex items-center gap-2 bg-white text-accent px-10 py-4 rounded-full hover:bg-white/95 transition-all duration-200 font-bold text-base hover:shadow-2xl active:scale-95">
              立即加入
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
