"use client";

import { useState, useRef } from "react";
import EmojiPicker from "./EmojiPicker";

export default function MessageInput({ onSend }: { onSend: (content: string) => Promise<boolean> }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const ok = await onSend(trimmed);
    if (ok) setContent("");
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  function insertEmoji(emoji: string) { setContent(p => p + emoji); setShowEmoji(false); textareaRef.current?.focus(); }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("文件不能超过 10MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!r.ok) {
        let msg = "上传失败";
        try { const d = await r.json(); msg = d.error || msg; } catch {}
        alert(msg);
        return;
      }
      const { url } = await r.json();
      const md = file.type.startsWith("video")
        ? `<video src="${url}" controls></video>`
        : `![${file.name}](${url})`;
      setContent(p => p + (p ? "\n" : "") + md);
    } catch { alert("上传失败"); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  return (
    <div className="relative border-t border-border pt-3">
      <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1} placeholder="输入消息... (Enter 发送 · Shift+Enter 换行)"
        className="w-full resize-none rounded-xl border border-border bg-surface-alt px-4 py-3 pr-28 text-sm text-ink placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
      />
      <div className="absolute right-2 bottom-3.5 flex items-center gap-1">
        <div className="relative">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-surface-alt transition-colors" title="表情">😊</button>
          {showEmoji && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:text-ink hover:bg-surface-alt transition-colors" title="上传（≤10MB）">
          {uploading ? "⏳" : "📎"}
        </button>
        <button type="button" onClick={submit} disabled={!content.trim() || sending}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent text-white disabled:opacity-30 hover:bg-accent-hover transition-colors" title="发送">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
