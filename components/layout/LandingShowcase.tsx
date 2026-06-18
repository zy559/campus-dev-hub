import Link from "next/link";
import { db } from "@/lib/db";

export default async function LandingShowcase() {
  const [totalPosts, totalUsers, boards, topPost, recentPosts] = await Promise.all([
    db.post.count(),
    db.user.count(),
    db.board.findMany({
      where: { parentId: null },
      include: { _count: { select: { posts: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.post.findFirst({
      orderBy: { comments: { _count: "desc" } },
      include: {
        author: { select: { username: true } },
        _count: { select: { comments: true } },
      },
    }),
    db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        author: { select: { username: true } },
        board: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  const cardBg = "bg-white dark:bg-slate-800";
  const cardOutline = "outline outline-slate-200 dark:outline-white/10";
  const sectionBg = "bg-[#FAFAFA] dark:bg-slate-950";
  const borderTop = "border-t border-slate-200/60 dark:border-white/5";

  return (
    <div className={`${sectionBg} py-24 sm:py-32 ${borderTop}`}>
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base font-semibold text-blue-600 dark:text-amber-400">
          社区数据一览
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          一个正在成长的校园社区
        </p>

        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          {/* ====== 大卡片：社区总览 (row-span-2) ====== */}
          <div className="relative lg:row-span-2">
            <div className={`absolute inset-px rounded-lg lg:rounded-l-4xl ${cardBg}`} />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white max-lg:text-center">社区总览</p>
                <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400 max-lg:text-center">
                  加入 {totalUsers} 位同学，一起分享 {totalPosts} 篇内容
                </p>
              </div>
              <div className="flex-1 flex flex-col justify-center px-8 sm:px-10 py-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "帖子总数", value: totalPosts, color: "text-blue-600 dark:text-amber-400" },
                    { label: "社区成员", value: totalUsers, color: "text-sky-500" },
                    { label: "话题板块", value: boards.length, color: "text-emerald-500" },
                    { label: "技术标签", value: "15+", color: "text-violet-500" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-2">
                  {boards.map((b) => (
                    <Link key={b.id} href={`/boards/${b.id}`}
                      className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-700/30 px-4 py-2.5 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors group">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{b.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{b._count.posts} 篇</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ${cardOutline} lg:rounded-l-4xl`} />
          </div>

          {/* ====== 右上：最热话题 ====== */}
          <div className="relative max-lg:row-start-1">
            <div className={`absolute inset-px rounded-lg max-lg:rounded-t-4xl ${cardBg}`} />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white max-lg:text-center">最热话题</p>
                <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400 max-lg:text-center">最近最受讨论的帖子</p>
              </div>
              <div className="flex flex-1 items-center px-8 sm:px-10 pb-6">
                {topPost ? (
                  <Link href={`/posts/${topPost.id}`} className="group w-full">
                    <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-4 ring-1 ring-slate-200 dark:ring-white/5 hover:ring-blue-300 dark:hover:ring-amber-500/30 transition-all">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">{topPost.title}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                        <span>{topPost.author.username}</span><span>·</span><span>💬 {topPost._count.comments}</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p className="text-slate-400 text-sm">还没有帖子，来做第一个吧</p>
                )}
              </div>
            </div>
            <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ${cardOutline} max-lg:rounded-t-4xl`} />
          </div>

          {/* ====== 右中：最新动态 ====== */}
          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <div className={`absolute inset-px rounded-lg ${cardBg}`} />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white max-lg:text-center">最新动态</p>
                <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400 max-lg:text-center">刚刚发布的内容</p>
              </div>
              <div className="flex-1 px-8 sm:px-10 pb-6 space-y-2.5">
                {recentPosts.length > 0 ? recentPosts.map((p) => (
                  <Link key={p.id} href={`/posts/${p.id}`} className="block rounded-lg bg-slate-100 dark:bg-slate-700/30 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors group">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-1">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{p.author.username}</span>
                      {p.board && <><span>·</span><span className="text-blue-500 dark:text-amber-400/70">{p.board.name}</span></>}
                      {p._count.comments > 0 && <><span>·</span><span>💬 {p._count.comments}</span></>}
                    </div>
                  </Link>
                )) : <p className="text-slate-400 text-xs">暂无内容</p>}
              </div>
            </div>
            <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ${cardOutline}`} />
          </div>

          {/* ====== 右列大卡：为什么选择围炉 (row-span-2) ====== */}
          <div className="relative lg:row-span-2">
            <div className={`absolute inset-px rounded-lg max-lg:rounded-b-4xl lg:rounded-r-4xl ${cardBg}`} />
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium text-slate-900 dark:text-white max-lg:text-center">为什么选择围炉</p>
                <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400 max-lg:text-center">属于每一个同学的校园社区</p>
              </div>
              <div className="flex-1 px-8 sm:px-10 py-6">
                <div className="space-y-5">
                  {[
                    { emoji: "✍️", title: "Markdown 写作", desc: "代码高亮 · 数学公式 · 表格 · 流程图" },
                    { emoji: "🏷️", title: "板块 + 标签", desc: "四板块 · 十五标签 · 精准检索" },
                    { emoji: "👥", title: "找到队友", desc: "比赛组队 · 课设协作 · 刷题打卡" },
                    { emoji: "💬", title: "私信聊天", desc: "一对一沟通 · 无需加微信" },
                    { emoji: "🔥", title: "技术有温度", desc: "写代码，也写日常" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex-shrink-0 size-8 rounded-lg bg-blue-50 dark:bg-amber-500/10 flex items-center justify-center text-sm">{item.emoji}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={`pointer-events-none absolute inset-px rounded-lg shadow-sm ${cardOutline} max-lg:rounded-b-4xl lg:rounded-r-4xl`} />
          </div>
        </div>
      </div>
    </div>
  );
}
