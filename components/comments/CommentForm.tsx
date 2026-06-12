"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CommentSchema } from "@/lib/validators";
import { ZodError } from "zod";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!session) {
    return (
      <div className="bg-surface-alt border border-border rounded-lg p-4 text-center">
        <p className="text-muted">
          请{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
            登录
          </Link>{" "}
          后发表评论
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      CommentSchema.parse({ content });
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues[0].message);
        return;
      }
    }

    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, postId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "评论失败，请重试");
      return;
    }

    setContent("");
    setSuccess(true);
    onCommentAdded?.();

    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="写下你的评论..."
        className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-y"
        aria-invalid={!!error}
        aria-describedby={error ? "comment-error" : undefined}
      />
      {error && (
        <p id="comment-error" className="text-sm text-error" role="alert">
          <span aria-hidden="true">⚠️ </span>{error}
        </p>
      )}
      {success && (
        <p className="text-sm text-success" role="status">
          <span aria-hidden="true">✅ </span>评论发布成功！
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "提交中..." : "发表评论"}
        </button>
      </div>
    </form>
  );
}
