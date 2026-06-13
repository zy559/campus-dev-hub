import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PostFeed from "@/components/posts/PostFeed";
import FetchError from "@/components/ui/FetchError";
import AutoCarousel from "@/components/ui/AutoCarousel";
import ScrollRow from "@/components/ui/ScrollRow";
import RevealObserver from "@/components/ui/RevealObserver";

/* ============================================================
   IMAGE ASSETS — Unsplash free-use photos
   Replace these with your own images anytime.
   ============================================================ */

const IMG = {
  heroBg:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&q=80",

  carousel: [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=900&q=80",
  ],

  topics: {
    algo:     "https://images.unsplash.com/photo-1504639725591-34d0984388bd?w=600&q=80",
    web:      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
    backend:  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    ai:       "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    os:       "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
    project:  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
    interview:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    notes:    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80",
  },
};

/* ============================================================
   DATA
   ============================================================ */

const heroSlides = [
  {
    id: "1", img: IMG.carousel[0],
    title: "📝 用 Markdown 分享技术",
    description: "代码高亮 · 表格支持 · 图片嵌入。写技术文章就像写代码一样自然。",
    link: "/",
  },
  {
    id: "2", img: IMG.carousel[1],
    title: "👥 找到你的项目队友",
    description: "刷题、做课设、打比赛——好的队友让学习事半功倍。",
    link: "/",
  },
  {
    id: "3", img: IMG.carousel[2],
    title: "📚 沉淀校园技术记忆",
    description: "课程心得、面试总结、项目展示——每个帖子都是真实经验。",
    link: "/",
  },
];

const topicCards = [
  { id: "algo",  img: IMG.topics.algo,      icon: "🧠", title: "算法与数据结构", description: "LeetCode 题解、竞赛总结、面试高频题型" },
  { id: "web",   img: IMG.topics.web,       icon: "🌐", title: "前端开发",        description: "React、Vue、CSS 技巧与项目实战" },
  { id: "be",    img: IMG.topics.backend,   icon: "⚙️", title: "后端架构",        description: "Go、Java、数据库设计与系统设计" },
  { id: "ai",    img: IMG.topics.ai,        icon: "🤖", title: "AI & 机器学习",   description: "深度学习、NLP、CV 论文解读与实践" },
  { id: "os",    img: IMG.topics.os,        icon: "💾", title: "操作系统",        description: "Linux 内核、进程调度、内存管理" },
  { id: "proj",  img: IMG.topics.project,   icon: "🚀", title: "项目实战",        description: "课设展示、开源贡献、Hackathon 作品" },
  { id: "intv",  img: IMG.topics.interview, icon: "💼", title: "面试经验",        description: "大厂面经、实习攻略、简历优化" },
  { id: "notes", img: IMG.topics.notes,     icon: "📖", title: "学习笔记",        description: "课程总结、考试复习、知识体系梳理" },
];

/* ============================================================
   Types
   ============================================================ */

interface Tag { id: string; name: string; }
interface PostCardData {
  id: string; title: string; content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[]; commentCount: number; createdAt: string;
}

/* ============================================================
   DEMO DATA — shown when API is unreachable (no DB)
   Delete this block when your database is connected.
   ============================================================ */

const DEMO_POSTS: PostCardData[] = [
  { id: "demo-1", title: "动态规划入门指南 — 从递归到记忆化搜索", content: "大三上学期算法课的笔记整理。动态规划的核心是找到最优子结构和状态转移方程。本文从斐波那契数列讲起，逐步过渡到背包问题、最长公共子序列等经典题型，希望能帮到正在刷题的同学。", author: { id: "u1", username: "算法小白", avatar: null }, tags: [{ id: "t-algo", name: "算法" }, { id: "t-dp", name: "动态规划" }], commentCount: 23, createdAt: "2026-06-10T08:00:00Z" },
  { id: "demo-2", title: "React Server Components 实战踩坑总结", content: "最近用 Next.js 14 的 App Router 重构了课程项目，RSC 的性能确实好，但 client boundary 的划分需要仔细设计。分享几个坑：useState 在 RSC 里不能用、props 序列化限制、以及如何正确拆分 client/server 组件。", author: { id: "u2", username: "前端小张", avatar: null }, tags: [{ id: "t-web", name: "前端" }, { id: "t-react", name: "React" }, { id: "t-next", name: "Next.js" }], commentCount: 15, createdAt: "2026-06-09T14:30:00Z" },
  { id: "demo-3", title: "编译原理课设求助 — LL(1) 文法分析器", content: "有没有同学在做编译器的课设？我在实现 LL(1) 预测分析表的时候遇到了 FOLLOW 集计算的问题。已经写了 First 集的代码，但 FOLLOW 集递归处理不太对。求大佬帮忙看看！", author: { id: "u3", username: "编译苦手", avatar: null }, tags: [{ id: "t-compiler", name: "编译原理" }, { id: "t-proj", name: "项目实战" }], commentCount: 8, createdAt: "2026-06-11T10:15:00Z" },
  { id: "demo-4", title: "腾讯暑期实习面经 — 三轮技术面 + HR 面", content: "刚拿到腾讯后端开发暑期实习 offer，分享一下面经。一面：算法题 + 操作系统基础（进程/线程/锁）；二面：系统设计 + 项目深挖；三面：总监面，聊技术视野和职业规划。整体难度中等偏上，准备充分的同学不用慌。", author: { id: "u4", username: "面经侠", avatar: null }, tags: [{ id: "t-interview", name: "面试经验" }, { id: "t-backend", name: "后端" }], commentCount: 42, createdAt: "2026-06-08T19:45:00Z" },
  { id: "demo-5", title: "Git 工作流最佳实践 — 从单人开发到团队协作", content: "从大一写作业到大三做团队项目，Git 的使用场景完全不同。整理一套适合课设团队的工作流：feature branch + rebase + PR review。附一个 cheatsheet，覆盖日常 90% 的场景。", author: { id: "u5", username: "Git达人", avatar: null }, tags: [{ id: "t-tools", name: "工具推荐" }, { id: "t-git", name: "Git" }, { id: "t-notes", name: "学习笔记" }], commentCount: 31, createdAt: "2026-06-07T16:20:00Z" },
  { id: "demo-6", title: "手写一个迷你操作系统 — xv6 实验笔记", content: "操作系统课选了 xv6 实验，从 boot loader 到进程调度，一步步拆解一个小型 Unix 系统的实现。这篇笔记覆盖 Lab 1-3：启动流程、内存管理（页表）、进程创建和上下文切换。", author: { id: "u6", username: "底层爱好者", avatar: null }, tags: [{ id: "t-os", name: "操作系统" }, { id: "t-notes", name: "学习笔记" }], commentCount: 19, createdAt: "2026-06-06T09:00:00Z" },
  { id: "demo-7", title: "Transformer 架构论文精读 — Attention Is All You Need", content: "逐段精读 Transformer 原论文，用图解的方式拆解 Self-Attention、Multi-Head Attention 和 Positional Encoding。适合刚入门 NLP 的同学，不需要太多前置知识。", author: { id: "u7", username: "AI新手", avatar: null }, tags: [{ id: "t-ai", name: "AI/ML" }, { id: "t-nlp", name: "NLP" }, { id: "t-paper", name: "论文解读" }], commentCount: 56, createdAt: "2026-06-05T11:30:00Z" },
];

const DEMO_TAGS: Tag[] = [
  { id: "tag-1", name: "算法" }, { id: "tag-2", name: "前端" }, { id: "tag-3", name: "后端" },
  { id: "tag-4", name: "AI/ML" }, { id: "tag-5", name: "操作系统" }, { id: "tag-6", name: "项目实战" },
  { id: "tag-7", name: "面试经验" }, { id: "tag-8", name: "学习笔记" },
];

/* ============================================================
   Data fetchers — with error state support
   ============================================================ */

async function getPosts(tag?: string): Promise<{ posts: PostCardData[]; total: number; error?: string }> {
  try {
    const url = tag
      ? `${process.env.NEXTAUTH_URL}/api/posts?tag=${tag}&limit=50`
      : `${process.env.NEXTAUTH_URL}/api/posts?limit=50`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      // API unavailable — serve demo data so the page isn't empty
      return { posts: DEMO_POSTS, total: DEMO_POSTS.length };
    }
    const data = await res.json();
    if (!data.posts || data.posts.length === 0) {
      return { posts: DEMO_POSTS, total: DEMO_POSTS.length };
    }
    return data;
  } catch {
    return { posts: DEMO_POSTS, total: DEMO_POSTS.length };
  }
}

async function getAllTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/tags`, { cache: "no-store" });
    if (!res.ok) return DEMO_TAGS;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return DEMO_TAGS;
    return data;
  } catch {
    return DEMO_TAGS;
  }
}

/* ============================================================
   Error display component
   ============================================================ */

/* ============================================================
   PAGE
   ============================================================ */

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const session = await getServerSession(authOptions);
  const tag = searchParams.tag;
  const [data, tags] = await Promise.all([getPosts(tag), getAllTags()]);
  const posts = data.posts || [];
  const total = data.total || 0;
  const fetchError = data.error;

  // ===== LOGGED IN =====
  if (session) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-ink">
              {tag ? `#${tag}` : "发现"}
            </h1>
            <p className="text-muted mt-1">
              {tag ? `${posts.length} 篇帖子` : "校园技术交流社区"}
            </p>
          </div>
          <Link
            href="/posts/new"
            className="bg-accent text-white px-5 py-2.5 rounded-full hover:bg-accent-hover transition-all duration-200 font-medium text-sm hover:shadow-xl hover:shadow-accent/30 active:scale-95"
          >
            发布帖子
          </Link>
        </div>

        {fetchError ? (
          <FetchError message={fetchError} />
        ) : (
          <PostFeed posts={posts} tags={tags} activeTag={tag} />
        )}
      </div>
    );
  }

  // ===== LANDING PAGE =====
  return (
    <div>
      <RevealObserver />

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-20" aria-hidden="true">
          <img
            src={IMG.heroBg}
            alt=""
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/70 via-surface/50 to-surface" />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-subtle/60 via-transparent to-accent-soft/30" />
        </div>

        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px] animate-blob" />
          <div className="absolute bottom-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px] animate-blob" style={{ animationDelay: '-10s' }} />
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
                分享知识
                <br />
                <span className="text-accent">找到队友</span>
              </h1>

              <p className="animate-fade-in-up stagger-2 text-lg text-muted mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                用 Markdown 写技术文章，和全校同学讨论课程与项目。
                一个人的笔记，全年级的力量。
              </p>

              <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-full hover:bg-accent-hover transition-all duration-200 font-semibold text-base hover:shadow-2xl hover:shadow-accent/35 active:scale-95"
                >
                  免费开始使用
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <a
                  href="#carousel"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-border hover:border-accent/30 transition-all duration-200 font-semibold text-ink bg-surface/70 backdrop-blur-sm active:scale-95"
                >
                  了解更多
                </a>
              </div>

              <div className="animate-fade-in-up stagger-4 flex gap-8 mt-10 justify-center lg:justify-start text-sm text-muted">
                {fetchError ? (
                  <span>⚡ 加载统计失败</span>
                ) : (
                  <>
                    <span>📝 {total || "..."} 篇帖子</span>
                    <span>🏷️ {tags.length} 个话题</span>
                  </>
                )}
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

      {/* ============================================================
          TOPIC SCROLL
          ============================================================ */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <div className="text-center reveal">
            <h2 className="text-3xl font-bold text-ink mb-3">探索你感兴趣的话题</h2>
            <p className="text-muted">左右滑动查看更多，每周都有新内容</p>
          </div>
        </div>
        <ScrollRow cards={topicCards} speed={25} />
      </section>

      {/* ============================================================
          FEATURED CAROUSEL
          ============================================================ */}
      <section id="carousel" className="py-24 px-6 bg-surface-alt">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-ink mb-3">社区精选</h2>
            <p className="text-muted">来自同学们的热门分享</p>
          </div>

          <div className="reveal">
            {fetchError ? (
              <div className="min-h-[320px] rounded-2xl flex items-center justify-center bg-surface-alt">
                <FetchError message="内容加载失败" />
              </div>
            ) : posts.length > 0 ? (
              <AutoCarousel
                slides={posts.slice(0, 5).map((post: PostCardData, i: number) => ({
                  id: post.id,
                  img: IMG.carousel[i % IMG.carousel.length],
                  title: post.title,
                  description: post.content.slice(0, 120) + (post.content.length > 120 ? "…" : ""),
                  link: `/posts/${post.id}`,
                }))}
                interval={5000}
              />
            ) : (
              <div className="min-h-[320px] rounded-2xl flex items-center justify-center bg-accent-subtle">
                <div className="text-center">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-muted">还没有帖子，成为第一个分享的人吧</p>
                  <Link href="/" className="inline-block mt-4 text-accent hover:text-accent-hover font-medium transition-colors">
                    立即开始 →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURE SHOWCASE
          ============================================================ */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto space-y-28">
          <div className="flex flex-col md:flex-row items-center gap-12 reveal">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent mb-4 tracking-wide">
                技术写作
              </span>
              <h3 className="text-2xl font-bold text-ink mb-3">
                GitHub 风格 Markdown，代码高亮零延迟
              </h3>
              <p className="text-muted leading-relaxed">
                从课程笔记到技术博客，从算法题解到项目文档。
                支持语法高亮、表格、数学公式、流程图——一切你需要的写作能力。
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <img src={IMG.carousel[0]} alt="程序员正在编写代码，屏幕上显示彩色语法高亮" className="w-full max-w-md rounded-2xl shadow-xl object-cover aspect-[4/3]" loading="lazy" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12 reveal">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-subtle text-accent mb-4 tracking-wide">
                社区互动
              </span>
              <h3 className="text-2xl font-bold text-ink mb-3">不只是浏览，更是参与</h3>
              <p className="text-muted leading-relaxed">
                评论讨论、标签筛选、个人主页……每个同学都有自己的技术名片。
                从课程心得到面试总结，沉淀的不只是信息，是校园技术记忆。
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <img src={IMG.carousel[1]} alt="几个学生围坐在桌前协作讨论，电脑屏幕上显示项目内容" className="w-full max-w-md rounded-2xl shadow-xl object-cover aspect-[4/3]" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          RECENT POSTS
          ============================================================ */}
      <section className="py-24 px-6 bg-surface-alt">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold text-ink mb-3">近期帖子</h2>
            <p className="text-muted">来自同学们的最新分享</p>
          </div>

          {fetchError ? (
            <div className="reveal"><FetchError message={fetchError} /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 reveal">
              <div className="text-5xl mb-4" aria-hidden="true">📝</div>
              <p className="text-muted text-lg">暂无帖子</p>
              <p className="text-subtle mt-2">
                成为第一个发帖的人，和全校同学分享你的技术见解
              </p>
              <Link href="/" className="inline-flex items-center gap-1.5 mt-6 text-accent hover:text-accent-hover font-medium transition-colors">
                立即开始
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          ) : (
            <div className="reveal">
              <PostFeed posts={posts.slice(0, 6)} tags={tags} />
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          CTA — using CSS token for gradient (theme-aware)
          ============================================================ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="relative overflow-hidden rounded-3xl p-12 sm:p-16 shadow-2xl reveal"
            style={{ background: "var(--cta-gradient)" }}
          >
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute bottom-[-30px] left-[-30px] w-60 h-60 rounded-full bg-white/8" aria-hidden="true" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 relative">
              准备好加入了吗？
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-md mx-auto relative">
              免费注册，开始分享你的第一篇技术文章。
              和全校同学一起，打造属于我们的技术社区。
            </p>
            <Link
              href="/"
              className="relative inline-flex items-center gap-2 bg-white text-accent px-10 py-4 rounded-full hover:bg-white/95 transition-all duration-200 font-bold text-base hover:shadow-2xl active:scale-95"
            >
              立即加入
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
