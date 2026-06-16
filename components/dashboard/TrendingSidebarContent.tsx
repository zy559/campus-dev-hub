import Link from "next/link";

interface TrendingPost {
  id: string;
  title: string;
  commentCount: number;
  author: { id: string; username: string };
}

interface ActivityItem {
  id: string;
  author: { id: string; username: string; avatar: string | null };
  post: { id: string; title: string };
  createdAt: string;
}

interface TrendingSidebarContentProps {
  trendingPosts: TrendingPost[];
  recentActivity: ActivityItem[];
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-indigo-500", "bg-cyan-500",
    "bg-violet-500", "bg-sky-500", "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function TrendingSidebarContent({
  trendingPosts,
  recentActivity,
}: TrendingSidebarContentProps) {
  return (
    <div className="space-y-5">
      {/* 热门帖子 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-semibold text-slate-800 tracking-wide">
            热门帖子
          </h3>
        </div>

        {trendingPosts.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">暂无热门帖子</p>
        ) : (
          <ul className="space-y-3">
            {trendingPosts.map((post, i) => (
              <li key={post.id} className="flex items-start gap-3 group">
                {/* 排名数字 */}
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-blue-100 text-blue-600"
                      : i === 1
                      ? "bg-indigo-100 text-indigo-600"
                      : i === 2
                      ? "bg-cyan-100 text-cyan-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                  >
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{post.author.username}</span>
                    <span>·</span>
                    <span>{post.commentCount} 评论</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/?sort=popular"
          className="block mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          查看全部 →
        </Link>
      </div>

      {/* 广告位 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📢</span>
          <h3 className="text-sm font-semibold text-slate-800 tracking-wide">
            广告位
          </h3>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">投放广告</p>
          <p className="text-xs text-slate-300 mt-1">联系管理员</p>
        </div>
        <Link
          href="/premium"
          className="block mt-3 text-center text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          了解会员 →
        </Link>
      </div>

      {/* 最近动态 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <span className="text-lg">📡</span>
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-wide">
            最近动态
          </h3>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">暂无动态</p>
        ) : (
          <ul className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-start gap-2.5">
                {/* 头像 */}
                <Link
                  href={`/profile/${activity.author.username}`}
                  className="flex-shrink-0"
                >
                  <span
                    className={`w-6 h-6 rounded-full ${avatarColor(activity.author.username)} flex items-center justify-center text-white text-[10px] font-bold`}
                  >
                    {activity.author.username.charAt(0).toUpperCase()}
                  </span>
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <Link
                      href={`/profile/${activity.author.username}`}
                      className="font-medium text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      {activity.author.username}
                    </Link>
                    <span className="text-slate-400 mx-1">评论了</span>
                    <Link
                      href={`/posts/${activity.post.id}`}
                      className="text-slate-500 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {activity.post.title}
                    </Link>
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {relativeTime(activity.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
