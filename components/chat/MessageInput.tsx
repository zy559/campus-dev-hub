"use client";

import { useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";

const quickReplies = [
  "我看到你的需求，想聊聊具体情况。",
  "我们好像挺同频的，可以认识一下吗？",
  "我想先简单了解一下，如果合适再互相介绍。",
];

export default function MessageInput({
  onSend,
  initialDraft = "",
  privateMode,
}: {
  onSend: (content: string) => Promise<boolean>;
  initialDraft?: string;
  privateMode?: boolean;
}) {
  const [content, setContent] = useState(initialDraft);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function insertText(text: string) {
    setContent((prev) => (prev ? `${prev}\n${text}` : text));
    textareaRef.current?.focus();
  }

  function insertEmoji(emoji: string) {
    setContent((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("文件不能超过 10MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        let msg = "上传失败";
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        alert(msg);
        return;
      }
      const { url } = await res.json();
      const markdown = file.type.startsWith("video") ? `<video src="${url}" controls></video>` : `![${file.name}](${url})`;
      setContent((prev) => prev + (prev ? "\n" : "") + markdown);
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => insertText(reply)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              privateMode ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-teal-50 text-teal-700 hover:bg-teal-100"
            }`}
          >
            {reply}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="输入消息... Enter 发送，Shift + Enter 换行"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-32 text-sm text-slate-900 transition-all placeholder:text-slate-500 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
        <div className="absolute bottom-3.5 right-2 flex items-center gap-1">
          <div className="relative">
            <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-slate-50" title="表情">
              🙂
            </button>
            {showEmoji && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title="上传图片或视频，最大 10MB"
          >
            {uploading ? "…" : "+"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!content.trim() || sending}
            className={`flex h-8 w-12 items-center justify-center rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-30 ${
              privateMode ? "bg-amber-500 hover:bg-amber-400" : "bg-teal-600 hover:bg-teal-500"
            }`}
            title="发送"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
