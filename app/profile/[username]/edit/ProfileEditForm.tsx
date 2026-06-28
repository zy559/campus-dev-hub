"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserTagSelector from "@/components/user/UserTagSelector";
import { avatarColor } from "@/lib/utils";

export default function ProfileEditForm({
  currentUsername,
  currentAvatar,
  currentBio,
  currentTagIds,
}: {
  currentUsername: string;
  currentAvatar: string;
  currentBio: string;
  currentTagIds: string[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(currentUsername);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [bio, setBio] = useState(currentBio);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(currentTagIds);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const usernameChanged = username.trim() !== currentUsername;

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setAvatar(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, avatar, bio, tagIds: selectedTagIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }
      if (usernameChanged) {
        setMessage("保存成功。昵称已变更，需要重新登录后会话里才会同步新昵称。");
        setTimeout(() => signOut({ callbackUrl: "/login" }), 1200);
        return;
      }
      setMessage("保存成功");
      router.refresh();
      router.push("/me");
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <section className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-black text-white"
            style={{ backgroundColor: avatarColor(username || currentUsername) }}
          >
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : (username || currentUsername).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {uploading ? "上传中..." : "修改头像"}
            </button>
            {avatar && (
              <button type="button" onClick={() => setAvatar("")} className="ml-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                移除
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
              }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">昵称</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
            placeholder="输入新的昵称"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-bold text-slate-700">个人简介</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-2 block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
            placeholder="介绍一下自己..."
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/88 p-5 shadow-sm backdrop-blur">
        <UserTagSelector selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} maxTags={5} label="兴趣标签" />
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-teal-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-500 disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
          取消
        </button>
      </div>
    </form>
  );
}
