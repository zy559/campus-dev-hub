"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostSchema } from "@/lib/validators";
import { ZodError } from "zod";

interface Tag {
  id: string;
  name: string;
}

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAllTags(Array.isArray(data) ? data : []))
      .catch(() => setAllTags([]));
  }, []);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    try {
      PostSchema.parse({ title, content, tagIds: selectedTagIds });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tagIds: selectedTagIds }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setServerError(data.error || "发布失败，请重试");
      return;
    }

    router.push(`/posts/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {serverError && (
        <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded" role="alert">
          <span aria-hidden="true">⚠️ </span>{serverError}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-muted mb-1">
          标题
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-lg"
          placeholder="输入帖子标题..."
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-error" role="alert">{errors.title}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="content" className="block text-sm font-medium text-muted">
            内容（支持 Markdown）
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-accent hover:text-accent-hover"
          >
            {showPreview ? "编辑" : "预览"}
          </button>
        </div>
        {showPreview ? (
          <div className="prose prose-orange max-w-none min-h-[300px] border border-border rounded-md p-4 bg-surface">
            <pre className="whitespace-pre-wrap font-sans text-ink">{content}</pre>
          </div>
        ) : (
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono text-sm"
            placeholder={"用 Markdown 写帖子内容...\n\n## 二级标题\n\n- 列表项\n- 列表项\n\n`代码块`"}
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? "content-error" : undefined}
          />
        )}
        {errors.content && (
          <p id="content-error" className="mt-1 text-sm text-error" role="alert">{errors.content}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          标签（最多 5 个）
        </label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                selectedTagIds.includes(tag.id)
                  ? "bg-accent text-white"
                  : "bg-surface-alt text-muted hover:bg-accent-soft"
              }`}
              aria-pressed={selectedTagIds.includes(tag.id)}
            >
              {tag.name}
            </button>
          ))}
          {allTags.length === 0 && (
            <p className="text-sm text-subtle">暂无可用标签</p>
          )}
        </div>
        {errors.tagIds && (
          <p className="mt-1 text-sm text-error" role="alert">{errors.tagIds}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white py-3 px-4 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-colors"
      >
        {loading ? "发布中..." : "发布帖子"}
      </button>
    </form>
  );
}
