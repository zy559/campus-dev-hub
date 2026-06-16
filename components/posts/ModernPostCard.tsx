"use client";

import Link from "next/link";

interface Tag {
  id: string;
  name: string;
}

interface ModernPostCardProps {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[];
  board?: { id: string; name: string };
  commentCount: number;
  createdAt: string;
}

// 蓝色系渐变集合
const GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-blue-600",
  "from-blue-400 to-cyan-600",
  "from-blue-600 to-indigo-700",
  "from-teal-500 to-cyan-600",
];

// 基于标题哈希选渐变
function pickGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// 作者头像颜色
function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-indigo-500", "bg-cyan-500",
    "bg-violet-500", "bg-sky-500", "bg-teal-500",
    "bg-blue-600", "bg-purple-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

export default function ModernPostCard({
  id,
  title,
  content,
  author,
  tags,
  board,
  commentCount,
  createdAt,
}: ModernPostCardProps) {
  const gradient = pickGradient(title);
  const displayTags = tags.slice(0, 2);

  return (
    <article className="group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
      {/* 缩略图区域 */}
      <Link href={`/posts/${id}`} className="block">
        <div
          className={`relative h-36 sm:h-40 bg-gradient-to-br ${gradient} overflow-hidden`}
        >
          {/* 装饰几何图形 */}
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute bottom-2 left-3 w-12 h-12 rounded-full bg-white/8" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-white/10 rotate-45 group-hover:rotate-90 transition-transform duration-700" />

          {/* 标题覆盖层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-md">
              {title}
            </h3>
          </div>
        </div>
      </Link>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 内容预览 */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
          {content.replace(/[#*`>]/g, "").slice(0, 200)}
        </p>

        {/* 底部元信息 */}
        <div className="flex items-center justify-between">
          {/* 作者 + 板块 */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <span
                className={`w-6 h-6 rounded-full ${avatarColor(author.username)} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
              >
                {author.username.charAt(0).toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-600 truncate max-w-[80px]">
                {author.username}
              </span>
            </Link>

            {board && (
              <Link
                href={`/boards/${board.id}`}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors flex-shrink-0"
              >
                {board.name}
              </Link>
            )}
          </div>

          {/* 时间 + 评论数 */}
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
            <span>{relativeTime(createdAt)}</span>
            {commentCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {commentCount}
              </span>
            )}
          </div>
        </div>

        {/* 标签 */}
        {displayTags.length > 0 && (
          <div className="flex gap-1.5 mt-3">
            {displayTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.name}`}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
