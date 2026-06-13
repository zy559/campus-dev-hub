"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostSchema } from "@/lib/validators";
import { ZodError } from "zod";

interface Tag { id: string; name: string; }
interface Board { id: string; name: string; }

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posted, setPosted] = useState<{ id: string; title: string } | null>(null);
  const [countdown, setCountdown] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/tags").then(r => r.json()).then(d => setAllTags(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/boards").then(r => r.json()).then(d => setBoards(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // 发布成功后倒计时
  useEffect(() => {
    if (!posted) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [posted, router]);

  function toggleTag(tagId: string) {
    setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) { const d = await res.json(); alert(d.error || "上传失败"); return; }
      const { url } = await res.json();
      const md = file.type.startsWith("video") ? `\n<video src="${url}" controls></video>\n` : `\n![${file.name}](${url})\n`;
      setContent(prev => prev + md);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch { alert("上传失败"); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({}); setServerError("");
    try { PostSchema.parse({ title, content, tagIds: selectedTagIds, boardId: selectedBoardId }); }
    catch (err) {
      if (err instanceof ZodError) { const fe: Record<string,string> = {}; err.issues.forEach(i => { if (i.path[0]) fe[i.path[0] as string] = i.message; }); setErrors(fe); return; }
    }
    setLoading(true);
    const res = await fetch("/api/posts", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ title, content, tagIds: selectedTagIds, boardId: selectedBoardId }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setServerError(data.error || "发布失败"); return; }
    setPosted({ id: data.id, title: data.title || title });
    setCountdown(5);
  }

  // 发布成功后的确认界面
  if (posted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center animate-scale-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-ink mb-3">发布成功！</h2>
        <p className="text-muted mb-2">「{posted.title}」已发布</p>
        <p className="text-subtle text-sm mb-8">
          {countdown} 秒后自动返回主页...
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href={`/posts/${posted.id}`}
            className="bg-accent text-white px-6 py-2.5 rounded-full hover:bg-accent-hover transition-colors text-sm font-medium"
          >
            查看帖子
          </Link>
          <button
            onClick={() => { setPosted(null); setTitle(""); setContent(""); setSelectedTagIds([]); setSelectedBoardId(""); }}
            className="px-6 py-2.5 rounded-full border border-border text-muted hover:bg-surface-alt transition-colors text-sm"
          >
            继续发布
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full border border-border text-muted hover:bg-surface-alt transition-colors text-sm"
          >
            返回主页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {serverError && (<div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded" role="alert"><span aria-hidden="true">⚠️ </span>{serverError}</div>)}

      {/* 板块选择 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">选择板块（可选）</label>
        {boards.length === 0 ? (
          <p className="text-xs text-subtle">暂无可用板块，可直接发帖</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {boards.map(b => (
              <button key={b.id} type="button" onClick={() => setSelectedBoardId(b.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedBoardId === b.id ? "bg-accent text-white" : "bg-surface-alt text-muted hover:bg-accent-soft"}`}>
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 标题 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-muted mb-1">标题</label>
        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)}
          className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-lg" placeholder="输入帖子标题..." />
        {errors.title && <p className="mt-1 text-sm text-error" role="alert">{errors.title}</p>}
      </div>

      {/* 内容 + 图片上传 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="content" className="block text-sm font-medium text-muted">内容（支持 Markdown）</label>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
            <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}
              className="text-sm text-accent hover:text-accent-hover flex items-center gap-1 transition-colors">
              {uploading ? "⏳ 上传中..." : "📎 插入图片/视频"}
            </button>
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-sm text-accent hover:text-accent-hover">
              {showPreview ? "编辑" : "预览"}
            </button>
          </div>
        </div>
        {showPreview ? (
          <div className="prose prose-orange max-w-none min-h-[300px] border border-border rounded-md p-4 bg-surface">
            <pre className="whitespace-pre-wrap font-sans text-ink">{content}</pre>
          </div>
        ) : (
          <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={16}
            className="block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono text-sm"
            placeholder={"用 Markdown 写帖子内容...\n\n## 二级标题\n\n- 列表项\n\n`代码块`\n\n点击 📎 插入图片或视频"} />
        )}
        {errors.content && <p className="mt-1 text-sm text-error" role="alert">{errors.content}</p>}
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">标签（最多 5 个）</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px] ${selectedTagIds.includes(tag.id) ? "bg-accent text-white" : "bg-surface-alt text-muted hover:bg-accent-soft"}`}>
              {tag.name}
            </button>
          ))}
        </div>
        {errors.tagIds && <p className="mt-1 text-sm text-error">{errors.tagIds}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-accent text-white py-3 px-4 rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-colors">
        {loading ? "发布中..." : "发布帖子"}
      </button>
    </form>
  );
}
