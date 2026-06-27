"use client";

import { useState } from "react";
import Link from "next/link";
import { avatarColor, relativeTime } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[];
  board?: { id: string; name: string };
  commentCount: number;
  createdAt: string;
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
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-sky-500 to-teal-600",
];

export default function PostCard({ id, title, content, author, tags, board, commentCount, createdAt }: PostCardProps) {
  const color = avatarColor(author.username);
  const media = extractFirstMedia(content);
  const cleanText = stripMarkdown(content);
  const gradient = THUMB_GRADIENTS[id.length % THUMB_GRADIENTS.length];

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-md">
      <div className="flex gap-4 p-4 sm:p-5">
        {media && (
          <Link href={`/posts/${id}`} className="hidden flex-shrink-0 sm:block">
            <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-slate-200 sm:h-24 sm:w-32 dark:bg-slate-700">
              {media.type === "image" ? (
                <ImageThumb src={media.url} gradient={gradient} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-sm font-bold text-white">
                  视频
                </div>
              )}
            </div>
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Link href={`/profile/${author.username}`} className="flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/50" style={{ backgroundColor: color }}>
                {author.username.charAt(0).toUpperCase()}
              </div>
            </Link>
            <Link href={`/profile/${author.username}`} className="text-xs font-medium text-ink transition-colors hover:text-accent">
              {author.username}
            </Link>
            <span className="text-[11px] text-subtle">{relativeTime(createdAt)}</span>
            {board && (
              <Link href={`/boards/${board.id}`} className="ml-auto flex-shrink-0 rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] text-accent transition-colors hover:bg-accent-soft">
                {board.name}
              </Link>
            )}
          </div>

          {media && media.type === "image" && (
            <Link href={`/posts/${id}`} className="float-right mb-2 ml-3 sm:hidden">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                <ImageThumb src={media.url} gradient={gradient} />
              </div>
            </Link>
          )}

          <Link href={`/posts/${id}`} className="group">
            <h2 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-ink transition-colors group-hover:text-accent sm:text-base">
              {title}
            </h2>
          </Link>

          {cleanText && <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">{cleanText}</p>}

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/activity?tag=${encodeURIComponent(tag.name)}`}
                  className="inline-flex min-h-[28px] items-center rounded-full bg-surface-alt px-2 py-1 text-[10px] text-muted transition-all hover:bg-accent-subtle hover:text-accent sm:text-xs"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
            <span className="flex-shrink-0 text-[10px] text-subtle sm:text-xs">{commentCount > 0 ? `评论 ${commentCount}` : ""}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ImageThumb({ src, gradient }: { src: string; gradient: string }) {
  const [state, setState] = useState<"loading" | "ok" | "failed">("loading");

  if (state === "failed") {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}>
        <span className="text-xs font-bold text-white/80">图片</span>
      </div>
    );
  }

  return (
    <>
      {state === "loading" && <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: state === "ok" ? 1 : 0 }}
        onLoad={() => setState("ok")}
        onError={() => setState("failed")}
        loading="lazy"
      />
    </>
  );
}
