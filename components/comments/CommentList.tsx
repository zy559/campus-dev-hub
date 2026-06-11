"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  async function fetchComments() {
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
  }

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchComments}
          className="mt-2 text-orange-600 hover:text-orange-800 text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        暂无评论，快来发表第一条评论吧
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white border border-gray-100 rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/profile/${comment.author.username}`}>
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                {comment.author.username.charAt(0).toUpperCase()}
              </div>
            </Link>
            <Link
              href={`/profile/${comment.author.username}`}
              className="text-sm font-medium text-gray-900 hover:text-orange-600"
            >
              {comment.author.username}
            </Link>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
