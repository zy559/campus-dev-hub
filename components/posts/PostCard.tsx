"use client";

import { useState } from "react";
import Link from "next/link";
import { avatarColor, relativeTime } from "@/lib/utils";

interface Tag { id: string; name: string; }
interface PostCardProps {
  id: string; title: string; content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[]; board?: { id: string; name: string }; commentCount: number; createdAt: string;
}

function extractFirstMedia(content: string): { url: string; type: "image" | "video" } | null {
  const imgMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (imgMatch) return { url: imgMatch[1], type: "image" };
  const vidMatch = content.match(/<video src="([^"]+)"/);
  if (vidMatch) return { url: vidMatch[1], type: "video" };
  return null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/<video[^>]*>[^<]*<\/video>/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_`>~]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 200);
}

const THUMB_GRADIENTS = [
  "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600", "from-cyan-500 to-blue-600", "from-rose-500 to-pink-600",
];

export default function PostCard({ id, title, content, author, tags, board, commentCount, createdAt }: PostCardProps) {
  const color = avatarColor(author.username);
  const media = extractFirstMedia(content);
  const cleanText = stripMarkdown(content);
  const gradient = THUMB_GRADIENTS[id.length % THUMB_GRADIENTS.length];

  return (
    <article className="bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-border-strong transition-all duration-200 overflow-hidden">
      <div className="flex gap-4 p-4 sm:p-5">
        {/* 缩略图 — 左侧小方图 */}
        {media && (
          <Link href={`/posts/${id}`} className="flex-shrink-0 hidden sm:block">
            <div className="w-28 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
              {media.type === "image" ? (
                <ImageThumb src={media.url} gradient={gradient} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <span className="text-3xl">🎬</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* 正文区 */}
        <div className="flex-1 min-w-0">
          {/* 作者行 */}
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/profile/${author.username}`} className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ring-1 ring-white/50" style={{ backgroundColor: color }}>
                {author.username.charAt(0).toUpperCase()}
              </div>
            </Link>
            <Link href={`/profile/${author.username}`} className="text-xs font-medium text-ink hover:text-accent transition-colors">{author.username}</Link>
            <span className="text-[11px] text-subtle">{relativeTime(createdAt)}</span>
            {board && (
              <Link href={`/boards/${board.id}`} className="ml-auto px-2 py-0.5 bg-accent-subtle text-accent text-[10px] rounded-full hover:bg-accent-soft transition-colors flex-shrink-0">{board.name}</Link>
            )}
          </div>

          {/* 手机端缩略图（在小屏上显示在标题右上方） */}
          {media && media.type === "image" && (
            <Link href={`/posts/${id}`} className="float-right ml-3 mb-2 sm:hidden">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                <ImageThumb src={media.url} gradient={gradient} />
              </div>
            </Link>
          )}

          {/* 标题 */}
          <Link href={`/posts/${id}`} className="group">
            <h2 className="text-sm sm:text-base font-bold text-ink mb-1 group-hover:text-accent transition-colors leading-snug line-clamp-2">{title}</h2>
          </Link>

          {/* 文本预览 */}
          {cleanText && (
            <p className="text-xs sm:text-sm text-muted mb-2 line-clamp-2 leading-relaxed">{cleanText}</p>
          )}

          {/* 标签 + 评论 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 3).map((tag) => (
                <Link key={tag.id} href={`/?tag=${tag.name}`}
                  className="px-2 py-1 bg-surface-alt text-muted text-[10px] sm:text-xs rounded-full hover:bg-accent-subtle hover:text-accent transition-all min-h-[28px] inline-flex items-center">{tag.name}</Link>
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-subtle flex-shrink-0">
              {commentCount > 0 ? `💬 ${commentCount}` : ""}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ImageThumb({ src, gradient }: { src: string; gradient: string }) {
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  if (state === "failed") {
    return <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}><span className="text-xl opacity-40">📷</span></div>;
  }

  return (
    <>
      {state === "loading" && <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />}
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: state === "ok" ? 1 : 0 }}
        onLoad={() => setState("ok")} onError={() => setState("failed")} loading="lazy" />
    </>
  );
}
