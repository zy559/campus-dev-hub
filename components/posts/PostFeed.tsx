"use client";

import { useMemo, useState } from "react";
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

type SortKey = "latest" | "popular";

interface PostFeedProps {
  posts: PostCardData[];
  tags: Tag[];
  activeTag?: string;
  initialSearch?: string;
}

export default function PostFeed({
  posts,
  tags,
  activeTag,
  initialSearch = "",
}: PostFeedProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<SortKey>("latest");

  const filtered = useMemo(() => {
    let result = [...posts];
    const q = search.trim().toLowerCase();

    if (q) {
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.author.username.toLowerCase().includes(q) ||
          post.tags.some((tag) => tag.name.toLowerCase().includes(q))
      );
    }

    if (sort === "popular") {
      result.sort((a, b) => b.commentCount - a.commentCount);
    }

    return result;
  }, [posts, search, sort]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 animate-fade-in-up stagger-1 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
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
            className="w-full rounded-xl border border-border bg-surface-alt py-2.5 pl-10 pr-4 text-sm text-ink transition-all placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-subtle/30 text-xs text-subtle transition-colors hover:bg-subtle/50"
              aria-label="清除搜索"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden whitespace-nowrap text-xs text-subtle sm:inline">排序：</span>
          {(
            [
              { key: "latest", label: "最新" },
              { key: "popular", label: "最热" },
            ] as { key: SortKey; label: string }[]
          ).map((option) => (
            <button
              key={option.key}
              onClick={() => setSort(option.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                sort === option.key
                  ? "bg-ink text-white shadow-sm"
                  : "border border-border bg-surface-alt text-muted hover:bg-accent-soft"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 animate-fade-in-up stagger-2">
        <Link
          href="/"
          className={`min-h-[36px] rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
            !activeTag
              ? "bg-ink text-white shadow-md"
              : "border border-border bg-surface-alt text-muted hover:bg-accent-soft"
          }`}
        >
          全部
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/?tag=${tag.name}`}
            className={`min-h-[36px] rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
              activeTag === tag.name
                ? "bg-ink text-white shadow-md"
                : "border border-border bg-surface-alt text-muted hover:bg-accent-soft"
            }`}
          >
            {tag.name}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="animate-fade-in py-20 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">
            {search ? "🔎" : "📝"}
          </div>
          {search ? (
            <>
              <p className="text-lg text-muted">没有找到匹配“{search}”的帖子</p>
              <p className="mt-2 text-subtle">
                试试其他关键词，或者
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  清除搜索
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-muted">暂无帖子</p>
              <p className="mt-2 text-subtle">成为第一个发布的人吧</p>
              <Link
                href="/posts/new"
                className="mt-4 inline-block font-medium text-accent transition-colors hover:text-accent-hover"
              >
                发布第一篇帖子 →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post, index) => (
            <div
              key={post.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <PostCard {...post} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
