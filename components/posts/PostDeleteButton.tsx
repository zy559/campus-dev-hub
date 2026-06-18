"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostDeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "删除失败");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      alert("网络错误");
    } finally {
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">确定删除？</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {deleting ? "删除中..." : "确认"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm border border-border text-muted rounded-lg hover:bg-surface-alt transition-colors"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 text-sm text-red-500 border border-red-200 dark:border-red-500/20 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
    >
      🗑️ 删除
    </button>
  );
}
