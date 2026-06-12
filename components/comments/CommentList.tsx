"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { avatarColor, relativeTime } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  createdAt: string;
}

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setComments(data);
    } catch {
      setError("评论加载失败");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="评论加载中">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-12 bg-surface-alt rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4" role="alert">
        <p className="text-error">
          <span aria-hidden="true">⚠️ </span>{error}
        </p>
        <button
          onClick={fetchComments}
          className="mt-2 text-accent hover:text-accent-hover text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-muted text-center py-8">
        暂无评论，快来发表第一条评论吧
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const color = avatarColor(comment.author.username);
        return (
          <div
            key={comment.id}
            className="bg-surface border border-border rounded-xl p-4 hover:border-border-strong transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: color }}
                >
                  {comment.author.username.charAt(0).toUpperCase()}
                </div>
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="text-sm font-semibold text-ink hover:text-accent transition-colors"
                >
                  {comment.author.username}
                </Link>
                <span className="text-xs text-subtle ml-2">
                  {relativeTime(comment.createdAt)}
                </span>
              </div>
            </div>
            <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
