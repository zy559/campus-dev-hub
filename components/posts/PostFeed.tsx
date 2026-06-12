"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PostCard from "@/components/posts/PostCard";

interface Tag {
  id: string;
  name: string;
}

interface PostCardData {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[];
  commentCount: number;
  createdAt: string;
}

type SortKey = "latest" | "popular" | "comments";

interface PostFeedProps {
  posts: PostCardData[];
  tags: Tag[];
  activeTag?: string;
}

export default function PostFeed({ posts, tags, activeTag }: PostFeedProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");

  const filtered = useMemo(() => {
    let result = [...posts];

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.username.toLowerCase().includes(q) ||
          p.tags.some((t) => t.name.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sort === "popular") {
      result.sort((a, b) => b.commentCount - a.commentCount);
    } else if (sort === "comments") {
      result.sort((a, b) => b.commentCount - a.commentCount);
    } else {
      // latest — already in server order
    }

    return result;
  }, [posts, search, sort]);

  return (
    <>
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up stagger-1">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索帖子标题、内容、作者..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm text-ink placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-subtle/30 text-subtle flex items-center justify-center text-xs hover:bg-subtle/50 transition-colors"
              aria-label="清除搜索"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-subtle whitespace-nowrap hidden sm:inline">排序：</span>
          {(
            [
              { key: "latest", label: "最新" },
              { key: "popular", label: "最热" },
              { key: "comments", label: "最多评论" },
            ] as { key: SortKey; label: string }[]
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                sort === opt.key
                  ? "bg-ink text-white shadow-sm"
                  : "bg-surface-alt text-muted hover:bg-accent-soft border border-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter pills */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up stagger-2">
        <Link
          href="/"
          className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px] ${
            !activeTag
              ? "bg-ink text-white shadow-md"
              : "bg-surface-alt text-muted hover:bg-accent-soft border border-border"
          }`}
        >
          全部
        </Link>
        {tags.map((t) => (
          <Link
            key={t.id}
            href={`/?tag=${t.name}`}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px] ${
              activeTag === t.name
                ? "bg-ink text-white shadow-md"
                : "bg-surface-alt text-muted hover:bg-accent-soft border border-border"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {/* Post list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-5xl mb-4" aria-hidden="true">
            {search ? "🔍" : "📝"}
          </div>
          {search ? (
            <>
              <p className="text-muted text-lg">没有找到匹配「{search}」的帖子</p>
              <p className="text-subtle mt-2">
                试试其他关键词，或者
                <button
                  onClick={() => setSearch("")}
                  className="text-accent hover:text-accent-hover font-medium ml-1 transition-colors"
                >
                  清除搜索
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-muted text-lg">暂无帖子</p>
              <p className="text-subtle mt-2">成为第一个发帖的人吧</p>
              <Link
                href="/posts/new"
                className="inline-block mt-4 text-accent hover:text-accent-hover font-medium transition-colors"
              >
                发布第一篇帖子 →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <div
              key={post.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <PostCard {...post} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
