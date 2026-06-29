"use client";

import { useState } from "react";
import Link from "next/link";
import { parsePostMedia } from "@/lib/postMedia";
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
  const media = parsePostMedia(content);
  if (media.images[0]) return { url: media.images[0], type: "image" };
  const vidMatch = content.match(/<video src="([^"]+)"/);
  if (vidMatch) return { url: vidMatch[1], type: "video" };
  return null;
}

function stripMarkdown(text: string): string {
  return parsePostMedia(text).text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/<video[^>]*>[^<]*<\/video>/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_`>~]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 200);
}

const THUMB_GRADIENTS = [
  "from-blue-400 to-teal-500",
  "from-emerald-400 to-cyan-500",
  "from-sky-400 to-indigo-400",
  "from-amber-300 to-teal-400",
  "from-cyan-400 to-blue-500",
  "from-teal-400 to-sky-500",
];

export default function PostCard({ id, title, content, author, tags, board, commentCount, createdAt }: PostCardProps) {
  const color = avatarColor(author.username);
  const media = extractFirstMedia(content);
  const cleanText = stripMarkdown(content);
  const gradient = THUMB_GRADIENTS[id.length % THUMB_GRADIENTS.length];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/88 shadow-sm backdrop-blur transition-all duration-200 hover:border-teal-200 hover:shadow-md">
      <div className="flex gap-4 p-4 sm:p-5">
        {media && (
          <Link href={`/posts/${id}`} className="hidden flex-shrink-0 sm:block">
            <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-32">
              {media.type === "image" ? (
                <ImageThumb src={media.url} gradient={gradient} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
                  视频
                </div>
              )}
            </div>
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Link href={`/profile/${author.username}`} className="flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-white/70" style={{ backgroundColor: color }}>
                {author.username.charAt(0).toUpperCase()}
              </div>
            </Link>
            <Link href={`/profile/${author.username}`} className="text-xs font-semibold text-slate-800 transition-colors hover:text-teal-700">
              {author.username}
            </Link>
            <span className="text-[11px] text-slate-500">{relativeTime(createdAt)}</span>
            {board && (
              <Link href={`/boards/${board.id}`} className="ml-auto flex-shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700 transition-colors hover:bg-teal-100">
                {board.name}
              </Link>
            )}
          </div>

          {media && media.type === "image" && (
            <Link href={`/posts/${id}`} className="float-right mb-2 ml-3 sm:hidden">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                <ImageThumb src={media.url} gradient={gradient} />
              </div>
            </Link>
          )}

          <Link href={`/posts/${id}`} className="group">
            <h2 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-slate-950 transition-colors group-hover:text-teal-700 sm:text-base">
              {title}
            </h2>
          </Link>

          {cleanText && <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{cleanText}</p>}

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/activity?tag=${encodeURIComponent(tag.name)}`}
                  className="inline-flex min-h-[28px] items-center rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600 ring-1 ring-slate-100 transition-all hover:bg-teal-50 hover:text-teal-700 sm:text-xs"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
            <span className="flex-shrink-0 text-[10px] text-slate-500 sm:text-xs">{commentCount > 0 ? `评论 ${commentCount}` : ""}</span>
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
        <span className="text-xs font-bold text-white/85">图片</span>
      </div>
    );
  }

  return (
    <>
      {state === "loading" && <div className="absolute inset-0 animate-pulse bg-slate-100" />}
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
