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

interface PostFeedProps {
  posts: PostCardData[];
  tags: Tag[];
  activeTag?: string;
  initialSearch?: string;
}

export default function PostFeed({ posts, initialSearch = "" }: PostFeedProps) {
  const [search, setSearch] = useState(initialSearch);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.username.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.name.toLowerCase().includes(q))
    );
  }, [posts, search]);

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索标题、内容、作者..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base font-bold text-slate-500">
            {search ? `没有找到“${search}”相关内容` : "暂无动态"}
          </p>
          <Link href="/posts/new?type=post" className="mt-4 inline-flex rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white">
            发布第一条动态
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </>
  );
}
