import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// 子板块渐变色映射
const BOARD_GRADIENTS: Record<string, string> = {
  "寻找比赛": "from-blue-400 to-indigo-600",
  "学习知识": "from-emerald-400 to-teal-600",
  "分享日常": "from-orange-400 to-red-500",
  "综合讨论": "from-violet-400 to-purple-600",
  "🍜 美食推荐": "from-orange-400 to-red-500",
  "🏀 运动健身": "from-green-400 to-emerald-600",
  "🎮 游戏娱乐": "from-purple-400 to-indigo-600",
  "📸 摄影随拍": "from-cyan-400 to-blue-500",
  "🎬 影视音乐": "from-pink-400 to-rose-500",
  "💬 心情杂谈": "from-yellow-400 to-amber-500",
  "🎉 活动聚会": "from-red-400 to-orange-500",
  "🛒 二手好物": "from-teal-400 to-cyan-600",
};

export default async function BoardsPage() {
  const boards = await db.board.findMany({
    where: { parentId: null },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
      _count: { select: { posts: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="py-6">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted hover:text-accent transition-colors">
          ← 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-ink mt-2">全部板块</h1>
        <p className="text-muted mt-1">选择你感兴趣的话题分区</p>
      </div>

      {/* 网格排列 */}
      <div className="space-y-10">
        {boards.map((board) => {
          const gradient = BOARD_GRADIENTS[board.name] || "from-gray-400 to-gray-600";
          const hasChildren = board.children.length > 0;

          return (
            <div key={board.id}>
              {/* 父板块卡片 */}
              <Link
                href={`/boards/${board.id}`}
                className="block group"
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]`}>
                  <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">{board.name}</h2>
                    <p className="text-white/75 text-sm">{board.description}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-white/60 text-xs">
                      {board._count.posts} 篇帖子
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>

              {/* 子板块（如有） */}
              {hasChildren && (
                <div className="mt-3 ml-2 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {board.children.map((child) => {
                    const childGradient = BOARD_GRADIENTS[child.name] || "from-gray-400 to-gray-500";
                    return (
                      <Link
                        key={child.id}
                        href={`/boards/${child.id}`}
                        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${childGradient} p-3 sm:p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]`}
                      >
                        <div className="absolute top-[-15px] right-[-15px] w-16 h-16 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                          <span className="text-xl sm:text-2xl block mb-1">{child.name.slice(0, 2)}</span>
                          <h4 className="font-semibold text-white text-xs sm:text-sm">
                            {child.name.replace(/^[^\s]+\s/, "")}
                          </h4>
                          <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 line-clamp-1">
                            {child.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 无板块时的 fallback */}
        {boards.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-4xl mb-4">📂</p>
            <p className="text-lg">暂无板块</p>
            <p className="text-sm mt-1">管理员正在设置中...</p>
          </div>
        )}
      </div>
    </div>
  );
}
