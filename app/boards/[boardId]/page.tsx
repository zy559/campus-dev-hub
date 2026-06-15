import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import PostFeed from "@/components/posts/PostFeed";
import BoardSelector from "@/components/boards/BoardSelector";
export const dynamic = 'force-dynamic';

async function getBoard(boardId: string) {
  return db.board.findUnique({
    where: { id: boardId },
    include: { parent: true, children: { orderBy: { sortOrder: "asc" } } },
  });
}

async function getPosts(boardId: string, tag?: string) {
  const where: Record<string, unknown> = { boardId };
  if (tag) where.tags = { some: { tag: { name: tag } } };
  const posts = await db.post.findMany({
    where,
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      tags: { include: { tag: true } },
      board: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content.slice(0, 300),
    author: post.author,
    tags: post.tags.map((pt) => pt.tag),
    board: post.board ?? undefined,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
  }));
}

async function getAllTags() {
  const tags = await db.tag.findMany({
    where: { posts: { some: {} } },
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return tags.map((t) => ({ id: t.id, name: t.name }));
}

// 日常子板块的渐变色映射
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

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: { boardId: string };
  searchParams: { tag?: string };
}) {
  const board = await getBoard(params.boardId);
  if (!board) notFound();

  const activeTag = searchParams.tag;
  const [posts, tags] = await Promise.all([
    getPosts(params.boardId, activeTag),
    getAllTags(),
  ]);

  // 是否是日常父板块
  const isDailyParent = board.name === "分享日常" && board.children.length > 0;

  return (
    <div className="py-6">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/" className="hover:text-accent transition-colors">
          首页
        </Link>
        <span>/</span>
        {board.parent ? (
          <>
            <Link
              href={`/boards/${board.parent.id}`}
              className="hover:text-accent transition-colors"
            >
              {board.parent.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-ink font-medium">{board.name}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mt-2">{board.name}</h1>
        <p className="text-muted mt-1">{board.description}</p>
      </div>

      {/* 子板块卡片网格 — 仅父板块显示 */}
      {isDailyParent && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-ink mb-4">子板块</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {board.children.map((child) => {
              const gradient = DAILY_GRADIENTS[child.name] || "from-gray-400 to-gray-500";
              return (
                <Link
                  key={child.id}
                  href={`/boards/${child.id}`}
                  className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="relative z-10">
                    <span className="text-2xl block mb-2">{child.name.slice(0, 2)}</span>
                    <h4 className="font-bold text-white text-sm mb-0.5">
                      {child.name.replace(/^[^\s]+\s/, "")}
                    </h4>
                    <p className="text-white/70 text-xs line-clamp-2">
                      {child.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <BoardSelector activeBoardId={params.boardId} />

      <div className="mt-8">
        <PostFeed posts={posts} tags={tags} activeTag={activeTag} />
      </div>
    </div>
  );
}
