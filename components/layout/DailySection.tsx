import Link from "next/link";
import { db } from "@/lib/db";

// 日常子板块的静态元数据 — emoji + 描述 + 渐变色
const DAILY_META: Record<string, { emoji: string; gradient: string }> = {
  "🍜 美食推荐": { emoji: "🍜", gradient: "from-orange-400 to-red-500" },
  "🏀 运动健身": { emoji: "🏀", gradient: "from-green-400 to-emerald-600" },
  "🎮 游戏娱乐": { emoji: "🎮", gradient: "from-purple-400 to-indigo-600" },
  "📸 摄影随拍": { emoji: "📸", gradient: "from-cyan-400 to-blue-500" },
  "🎬 影视音乐": { emoji: "🎬", gradient: "from-pink-400 to-rose-500" },
  "💬 心情杂谈": { emoji: "💬", gradient: "from-yellow-400 to-amber-500" },
  "🎉 活动聚会": { emoji: "🎉", gradient: "from-red-400 to-orange-500" },
  "🛒 二手好物": { emoji: "🛒", gradient: "from-teal-400 to-cyan-600" },
};

export default async function DailySection() {
  // 查找「分享日常」主板块
  const dailyBoard = await db.board.findUnique({
    where: { name: "分享日常" },
  });

  if (!dailyBoard) {
    // 日常板块还没创建（数据库未 seed），返回空
    return null;
  }

  // 获取日常板块下的子板块
  const subBoards = await db.board.findMany({
    where: { parentId: dailyBoard.id },
    orderBy: { sortOrder: "asc" },
  });

  if (subBoards.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-surface-alt/30">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent-subtle text-accent mb-4">
            📋 分享日常
          </span>
          <h2 className="text-3xl font-bold text-ink mb-3">不只是技术，还有生活</h2>
          <p className="text-muted max-w-lg mx-auto">
            和全校同学分享校园日常——美食、运动、游戏、摄影，总有一个话题适合你
          </p>
        </div>

        {/* 子板块卡片网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {subBoards.map((board) => {
            const meta = DAILY_META[board.name] || { emoji: "📌", gradient: "from-gray-400 to-gray-500" };
            return (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
              >
                {/* 渐变背景 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}
                />
                {/* 装饰圆 */}
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-[-10px] left-[-10px] w-16 h-16 rounded-full bg-white/8" />

                {/* 内容 */}
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block drop-shadow-md">{meta.emoji}</span>
                  <h4 className="font-bold text-white text-base sm:text-lg mb-1 drop-shadow-sm">
                    {board.name.replace(/^[^\s]+\s/, "")}
                  </h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed drop-shadow-sm line-clamp-2">
                    {board.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 查看全部日常 */}
        <div className="text-center mt-8">
          <Link
            href={`/boards/${dailyBoard.id}`}
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium text-sm transition-colors"
          >
            查看全部日常帖子
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
