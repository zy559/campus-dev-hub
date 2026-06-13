"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserTagSelector from "@/components/user/UserTagSelector";

export default function ProfileEditForm({
  currentBio,
  currentTagIds,
}: {
  username: string;
  currentBio: string;
  currentTagIds: string[];
}) {
  const router = useRouter();
  const [bio, setBio] = useState(currentBio);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentTagIds);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(""); setError("");

    try {
      const res = await fetch("/api/user/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: selectedTagIds }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "保存失败"); return; }
      setMessage("保存成功");
      router.refresh();
    } catch { setError("保存失败"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded">✅ {message}</div>
      )}
      {error && (
        <div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded" role="alert">{error}</div>
      )}

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-muted mb-1">个人简介</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="介绍一下自己..."
        />
      </div>

      <UserTagSelector
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
        maxTags={5}
        label="兴趣标签"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-md border border-border text-muted hover:bg-surface-alt transition-colors text-sm"
        >
          取消
        </button>
      </div>
    </form>
  );
}
