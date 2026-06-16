import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";
import StatsBar from "./StatsBar";
import TrendingSidebarContent from "./TrendingSidebarContent";

interface Tag {
  id: string;
  name: string;
}

interface PostCardData {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[];
  board?: { id: string; name: string };
  commentCount: number;
  createdAt: string;
}

const DAILY_GRADIENTS: Record<string, string> = {
  "🍜 美食推荐": "from-orange-400 to-red-500",
  "🏀 运动健身": "from-green-400 to-emerald-600",
  "🎮 游戏娱乐": "from-purple-400 to-indigo-600",
  "📸 摄影随拍": "from-cyan-400 to-blue-500",
  "🎬 影视音乐": "from-pink-400 to-rose-500",
  "💬 心情杂谈": "from-yellow-400 to-amber-500",
  "🎉 活动聚会": "from-red-400 to-orange-500",
  "🛒 二手好物": "from-teal-400 to-cyan-600",
};

async function getDailyBoards() {
  const daily = await db.board.findUnique({
    where: { name: "分享日常" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
  return daily?.children ?? [];
}

async function getPosts(tag?: string): Promise<{
  posts: PostCardData[];
  total: number;
}> {
  const where = tag ? { tags: { some: { tag: { name: tag } } } } : {};
  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        tags: { include: { tag: true } },
        board: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.post.count({ where }),
  ]);
  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content.slice(0, 300),
      author: p.author,
      tags: p.tags.map((pt) => pt.tag),
      board: p.board ?? undefined,
      commentCount: p._count.comments,
      createdAt: p.createdAt.toISOString(),
    })),
    total,
  };
}

async function getAllTags(): Promise<Tag[]> {
  const tags = await db.tag.findMany({
    where: { posts: { some: {} } },
    orderBy: { name: "asc" },
  });
  return tags.map((t) => ({ id: t.id, name: t.name }));
}

async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalPosts, totalUsers, commentsToday, postsThisWeek] =
    await Promise.all([
      db.post.count(),
      db.user.count(),
      db.comment.count({
        where: { createdAt: { gte: todayStart } },
      }),
      db.post.count({
        where: { createdAt: { gte: weekAgo } },
      }),
    ]);

  return { totalPosts, totalUsers, commentsToday, postsThisWeek };
}

async function getTrendingPosts() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const posts = await db.post.findMany({
    where: { createdAt: { gte: weekAgo } },
    include: {
      author: { select: { id: true, username: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { comments: { _count: "desc" } },
    take: 5,
  });
  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    commentCount: p._count.comments,
    author: p.author,
  }));
}

async function getRecentActivity() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      post: { select: { id: true, title: true } },
    },
  });
  return comments.map((c) => ({
    id: c.id,
    author: c.author,
    post: c.post,
    createdAt: c.createdAt.toISOString(),
  }));
}

export default async function DashboardFeed({
  tag,
  search,
}: {
  tag?: string;
  search: string;
}) {
  const [data, tags, dailyBoards, stats, trendingPosts, recentActivity] =
    await Promise.all([
      getPosts(tag),
      getAllTags(),
      getDailyBoards(),
      getStats(),
      getTrendingPosts(),
      getRecentActivity(),
    ]);

  return (
    <div className="flex gap-8 min-h-[calc(100vh-4rem)] bg-slate-50/50">
      {/* === 主内容区 === */}
      <main className="flex-1 min-w-0 py-6 px-4 lg:px-6 max-w-4xl mx-auto xl:mx-0">
        <div className="space-y-8">
          {/* 统计横幅 */}
          <StatsBar stats={stats} />

          {/* 日常子板块入口 */}
          {dailyBoards.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 tracking-wide uppercase">
                  📋 分享日常
                </h3>
                <Link
                  href="/boards"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  查看全部 →
                </Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {dailyBoards.map((board) => {
                  const gradient =
                    DAILY_GRADIENTS[board.name] || "from-slate-400 to-slate-500";
                  return (
                    <Link
                      key={board.id}
                      href={`/boards/${board.id}`}
                      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-3 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95`}
                    >
                      <div className="text-center">
                        <span className="text-2xl block mb-1 drop-shadow-sm">
                          {board.name.slice(0, 2)}
                        </span>
                        <span className="text-[10px] sm:text-xs font-medium text-white/90 line-clamp-1">
                          {board.name.replace(/^[^\s]+\s/, "")}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 帖子区域标题 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {tag ? `#${tag}` : "发现"}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {tag
                  ? `${data.posts.length} 篇帖子`
                  : `${data.total} 篇帖子 · 校园技术交流社区`}
              </p>
            </div>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30 active:scale-95"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              发布帖子
            </Link>
          </div>

          {/* 帖子网格 */}
          <PostFeed
            posts={data.posts}
            tags={tags}
            activeTag={tag}
            initialSearch={search}
          />
        </div>
      </main>

      {/* === 右侧边栏 === */}
      <aside className="w-[300px] flex-shrink-0 hidden xl:block pt-6">
        <div className="sticky top-20">
          <TrendingSidebarContent
            trendingPosts={trendingPosts}
            recentActivity={recentActivity}
          />
        </div>
      </aside>
    </div>
  );
}
