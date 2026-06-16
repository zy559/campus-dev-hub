interface StatsBarProps {
  stats: {
    totalPosts: number;
    totalUsers: number;
    commentsToday: number;
    postsThisWeek: number;
  };
}

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

const STAT_ITEMS = [
  { key: "totalPosts", label: "帖子总数", icon: "📄", color: "from-blue-500 to-blue-600" },
  { key: "totalUsers", label: "社区成员", icon: "👥", color: "from-indigo-500 to-indigo-600" },
  { key: "commentsToday", label: "今日讨论", icon: "💬", color: "from-cyan-500 to-cyan-600" },
  { key: "postsThisWeek", label: "本周新帖", icon: "🔥", color: "from-violet-500 to-violet-600" },
] as const;

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100/60 p-6">
      {/* 装饰元素 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-indigo-500/[0.03] rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-cyan-500/[0.03] rounded-full blur-2xl" />

      {/* 统计卡片网格 */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_ITEMS.map((item) => {
          const value = stats[item.key as keyof typeof stats];
          return (
            <div
              key={item.key}
              className="group bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm shadow-sm shadow-blue-500/20`}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                  {item.label}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                {formatNumber(value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
