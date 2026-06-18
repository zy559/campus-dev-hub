"use client";

import { useState } from "react";

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  senderName: string;
  createdAt: string;
}

function parseContent(content: string): { type: "text" | "image" | "video"; value: string }[] {
  // Image: ![alt](url)  or  [img]url[/img]
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  // Video: <video src="url" controls></video>
  const vidRegex = /<video src="([^"]+)"[^>]*><\/video>/g;

  // Collect all matches
  interface Match { index: number; end: number; type: "image" | "video"; value: string }
  const matches: Match[] = [];

  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(content)) !== null) {
    matches.push({ index: m.index, end: m.index + m[0].length, type: "image", value: m[2] });
  }
  while ((m = vidRegex.exec(content)) !== null) {
    matches.push({ index: m.index, end: m.index + m[0].length, type: "video", value: m[1] });
  }
  matches.sort((a, b) => a.index - b.index);

  // Build parts
  const parts: { type: "text" | "image" | "video"; value: string }[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.index > cursor) {
      const text = content.slice(cursor, match.index).trim();
      if (text) parts.push({ type: "text", value: text });
    }
    parts.push({ type: match.type, value: match.value });
    cursor = match.end;
  }
  if (cursor < content.length) {
    const text = content.slice(cursor).trim();
    if (text) parts.push({ type: "text", value: text });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: content }];
}

export default function MessageBubble({ content, isMine, senderName, createdAt }: MessageBubbleProps) {
  const parts = parseContent(content);
  const textContent = parts.filter(p => p.type === "text").map(p => p.value).join(" ").trim();

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%]`}>
        {!isMine && (
          <p className="text-xs text-muted ml-1 mb-1">{senderName}</p>
        )}

        {/* 文本内容 */}
        {textContent && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
              isMine
                ? "bg-accent text-white rounded-br-md"
                : "bg-surface-alt text-ink rounded-bl-md border border-border"
            }`}
          >
            {textContent}
          </div>
        )}

        {/* 媒体内容 */}
        {parts.filter(p => p.type === "image" || p.type === "video").map((part, i) => (
          <div key={i} className={`mt-1.5 ${isMine ? "flex justify-end" : ""}`}>
            {part.type === "image" ? (
              <ImageWithFallback src={part.value} />
            ) : (
              <video src={part.value} controls className="max-w-full max-h-64 rounded-xl" preload="metadata" />
            )}
          </div>
        ))}

        <p className={`text-xs text-subtle mt-1 ${isMine ? "text-right mr-1" : "ml-1"}`}>
          {new Date(createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function ImageWithFallback({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return (
    <a href={src} target="_blank" rel="noopener noreferrer"
      className="inline-block px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs text-accent underline">
      📷 查看图片
    </a>
  );

  return (
    <div className="relative">
      {!loaded && (
        <div className="w-48 h-36 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
      )}
      <img
        src={src}
        alt=""
        className="max-w-full max-h-64 rounded-xl object-cover"
        style={{ display: loaded ? "block" : "none" }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}
