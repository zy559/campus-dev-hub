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
  const vidMatch = content.match(/<video src="([^"]+)"/ );
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
    <article className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5">
      {/* 缩略图 */}
      {media && (
        <Link href={`/posts/${id}`} className="block relative aspect-[16/9] overflow-hidden bg-slate-200 dark:bg-slate-700">
          {media.type === "image" ? (
            <ImageThumb src={media.url} gradient={gradient} title={title} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <span className="text-5xl">🎬</span>
            </div>
          )}
        </Link>
      )}

      <div className="p-5 sm:p-6">
        {/* 作者行 */}
        <div className="flex items-center gap-3 mb-3">
          <Link href={`/profile/${author.username}`} className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/50" style={{ backgroundColor: color }}>
              {author.username.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${author.username}`} className="text-sm font-semibold text-ink hover:text-accent transition-colors">{author.username}</Link>
            <span className="text-xs text-subtle ml-2">{relativeTime(createdAt)}</span>
          </div>
          {board && (
            <Link href={`/boards/${board.id}`} className="px-2 py-0.5 bg-accent-subtle text-accent text-xs rounded-full hover:bg-accent-soft transition-colors flex-shrink-0">{board.name}</Link>
          )}
        </div>

        {/* 标题 */}
        <Link href={`/posts/${id}`} className="group">
          <h2 className="text-base sm:text-lg font-bold text-ink mb-1.5 group-hover:text-accent transition-colors leading-snug line-clamp-2">{title}</h2>
        </Link>

        {/* 文本预览 */}
        {cleanText && (
          <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">{cleanText}</p>
        )}

        {/* 标签 + 评论 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/?tag=${tag.name}`}
                className="px-2.5 py-1.5 bg-surface-alt text-muted text-xs rounded-full hover:bg-accent-subtle hover:text-accent transition-all duration-200 min-h-[36px] inline-flex items-center">{tag.name}</Link>
            ))}
          </div>
          <span className="text-xs text-subtle flex-shrink-0 ml-3">
            {commentCount > 0 ? `💬 ${commentCount}` : ""}
          </span>
        </div>
      </div>
    </article>
  );
}

function ImageThumb({ src, gradient, title }: { src: string; gradient: string; title: string }) {
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  if (state === "failed") {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-4xl opacity-30">📷</span>
        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-white/80 text-sm font-medium line-clamp-2 drop-shadow-md">{title}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {state === "loading" && <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />}
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: state === "ok" ? 1 : 0 }}
        onLoad={() => setState("ok")}
        onError={() => setState("failed")}
        loading="lazy"
      />
    </>
  );
}
