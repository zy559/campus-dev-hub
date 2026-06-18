"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostSchema } from "@/lib/validators";
import { ZodError } from "zod";

interface Tag { id: string; name: string; }
interface Board { id: string; name: string; }

interface UploadedMedia { url: string; name: string; type: "image" | "video"; }

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
  const [dragOver, setDragOver] = useState(false);
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [posted, setPosted] = useState<{ id: string; title: string } | null>(null);
  const [countdown, setCountdown] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/tags").then(r => r.json()).then(d => setAllTags(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/boards").then(r => r.json()).then(d => setBoards(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!posted) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); window.location.href = "/"; return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [posted, router]);

  // ---------- 拖拽 / 粘贴 / 文件选择统一上传入口 ----------

  const uploadAndInsert = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        let msg = "上传失败";
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        alert(msg);
        return;
      }
      const { url } = await res.json();

      const isVideo = file.type.startsWith("video");
      const md = isVideo ? `\n<video src="${url}" controls></video>\n` : `\n![${file.name}](${url})\n`;
      setContent(prev => prev + md);
      setMediaList(prev => [...prev, { url, name: file.name, type: isVideo ? "video" : "image" }]);
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  }, []);

  // 文件选择
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAndInsert(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // 拖拽
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    if (e.currentTarget === e.target) setDragOver(false);
  }
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      await uploadAndInsert(files[i]);
    }
  }

  // 粘贴（Ctrl+V）
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    async function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await uploadAndInsert(file);
        }
      }
    }
    textarea.addEventListener("paste", onPaste);
    return () => textarea.removeEventListener("paste", onPaste);
  }, [uploadAndInsert]);

  // ---------- 标签 ----------

  function toggleTag(tagId: string) {
    setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }

  // ---------- 发布 ----------

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
    // 触发服务器端 ISR 刷新
    try { await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/" }) }); } catch {}
    setPosted({ id: data.id, title: data.title || title });
    setCountdown(5);
  }

  // ---------- 发布成功 ----------

  if (posted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center animate-scale-in">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-ink mb-3">发布成功！</h2>
        <p className="text-muted mb-2">「{posted.title}」已发布</p>
        <p className="text-subtle text-sm mb-8">{countdown} 秒后自动返回主页...</p>
        <div className="flex gap-3 justify-center">
          <Link href={`/posts/${posted.id}`} className="bg-accent text-white px-6 py-2.5 rounded-full hover:bg-accent-hover transition-colors text-sm font-medium">查看帖子</Link>
          <button onClick={() => { setPosted(null); setTitle(""); setContent(""); setSelectedTagIds([]); setSelectedBoardId(""); setMediaList([]); }} className="px-6 py-2.5 rounded-full border border-border text-muted hover:bg-surface-alt transition-colors text-sm">继续发布</button>
          <a href="/" className="px-6 py-2.5 rounded-full border border-border text-muted hover:bg-surface-alt transition-colors text-sm">返回主页</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {serverError && (<div className="bg-error-bg border border-error-border text-error px-4 py-3 rounded-lg" role="alert"><span aria-hidden="true">⚠️ </span>{serverError}</div>)}

      {/* 板块选择 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">选择板块（可选）</label>
        {boards.length === 0 ? (
          <p className="text-xs text-subtle">暂无可用板块，可直接发帖</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {boards.map(b => (
              <button key={b.id} type="button" onClick={() => setSelectedBoardId(b.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] ${selectedBoardId === b.id ? "bg-accent text-white" : "bg-surface-alt text-muted hover:bg-accent-soft"}`}>
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
          className="block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 text-lg" placeholder="输入帖子标题..." />
        {errors.title && <p className="mt-1 text-sm text-error" role="alert">{errors.title}</p>}
      </div>

      {/* 内容 + 拖拽上传区 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="content" className="block text-sm font-medium text-muted">内容（支持 Markdown）</label>
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
            <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}
              className="text-sm text-accent hover:text-accent-hover flex items-center gap-1 transition-colors">
              {uploading ? "⏳ 上传中..." : "📎 选择文件"}
            </button>
            <span className="text-xs text-subtle">| 拖拽 · 粘贴 · 点选</span>
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-sm text-accent hover:text-accent-hover transition-colors">
              {showPreview ? "✏️ 编辑" : "👁 预览"}
            </button>
          </div>
        </div>

        {/* 拖拽覆盖提示层 */}
        <div className="relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {dragOver && (
            <div className="absolute inset-0 z-10 bg-accent/10 border-2 border-dashed border-accent rounded-lg flex items-center justify-center pointer-events-none animate-fade-in">
              <span className="text-accent font-semibold text-lg">📥 松手以插入</span>
            </div>
          )}

          {showPreview ? (
            <div className="prose prose-orange max-w-none min-h-[300px] border border-border rounded-lg p-4 bg-surface">
              <pre className="whitespace-pre-wrap font-sans text-ink">{content}</pre>
            </div>
          ) : (
            <textarea ref={textareaRef} id="content" value={content} onChange={e => setContent(e.target.value)}
              rows={8}
              className="block w-full rounded-lg border border-border px-3 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm sm:min-h-[400px] transition-all"
              placeholder={"用 Markdown 写帖子内容...\n\n## 二级标题\n\n- 列表项\n\n`代码行内`\n\n> 引用\n\nCtrl+V 粘贴图片 | 拖拽文件到此处"} />
          )}
        </div>
        {errors.content && <p className="mt-1 text-sm text-error" role="alert">{errors.content}</p>}

        {/* 缩略图预览条 */}
        {mediaList.length > 0 && (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {mediaList.map((m, i) => (
              <div key={i} className="flex-shrink-0 relative group">
                {m.type === "video" ? (
                  <div className="w-24 h-24 rounded-lg bg-black flex items-center justify-center">
                    <span className="text-3xl">🎬</span>
                  </div>
                ) : (
                  <img src={m.url} alt={m.name} className="w-24 h-24 rounded-lg object-cover border border-border" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMediaList(prev => prev.filter((_, j) => j !== i));
                    // 从 content 中移除对应链接
                    setContent(prev => prev.replace(new RegExp(`(\\!\\[.*?\\]\\(${m.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)|<video src="${m.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" controls></video>)`, "g"), ""));
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-2">标签（最多 5 个）</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${selectedTagIds.includes(tag.id) ? "bg-accent text-white" : "bg-surface-alt text-muted hover:bg-accent-soft"}`}>
              {tag.name}
            </button>
          ))}
        </div>
        {errors.tagIds && <p className="mt-1 text-sm text-error">{errors.tagIds}</p>}
      </div>

      {/* 发布 */}
      <button type="submit" disabled={loading}
        className="w-full bg-accent text-white py-3 px-4 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-colors">
        {loading ? "发布中..." : mediaList.length > 0 ? `📷 发布帖子（含 ${mediaList.length} 个附件）` : "发布帖子"}
      </button>
    </form>
  );
}
