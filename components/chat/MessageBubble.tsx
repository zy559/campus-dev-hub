"use client";

import { useState } from "react";
import { avatarColor } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  senderName: string;
  senderAvatar?: string | null;
  createdAt: string;
  privateMode?: boolean;
}

function parseContent(content: string): { type: "text" | "image" | "video"; value: string }[] {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const vidRegex = /<video src="([^"]+)"[^>]*><\/video>/g;
  interface Match {
    index: number;
    end: number;
    type: "image" | "video";
    value: string;
  }
  const matches: Match[] = [];

  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(content)) !== null) {
    matches.push({ index: m.index, end: m.index + m[0].length, type: "image", value: m[2] });
  }
  while ((m = vidRegex.exec(content)) !== null) {
    matches.push({ index: m.index, end: m.index + m[0].length, type: "video", value: m[1] });
  }
  matches.sort((a, b) => a.index - b.index);

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

export default function MessageBubble({ content, isMine, senderName, senderAvatar, createdAt, privateMode }: MessageBubbleProps) {
  const parts = parseContent(content);
  const textContent = parts.filter((p) => p.type === "text").map((p) => p.value).join(" ").trim();
  const mineClass = privateMode ? "bg-amber-500 text-white" : "bg-teal-600 text-white";

  return (
    <div className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
      {!isMine && <Avatar username={senderName} avatar={senderAvatar} />}
      <div className="max-w-[75%]">
        {!isMine && <p className="mb-1 ml-1 text-xs text-slate-500">{senderName}</p>}

        {textContent && (
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
              isMine ? `${mineClass} rounded-br-md` : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
            }`}
          >
            {textContent}
          </div>
        )}

        {parts
          .filter((p) => p.type === "image" || p.type === "video")
          .map((part, i) => (
            <div key={i} className={`mt-1.5 ${isMine ? "flex justify-end" : ""}`}>
              {part.type === "image" ? (
                <ImageWithFallback src={part.value} />
              ) : (
                <video src={part.value} controls className="max-h-64 max-w-full rounded-xl" preload="metadata" />
              )}
            </div>
          ))}

        <p className={`mt-1 text-xs text-slate-500 ${isMine ? "mr-1 text-right" : "ml-1"}`}>
          {new Date(createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isMine && <Avatar username={senderName} avatar={senderAvatar} />}
    </div>
  );
}

function Avatar({ username, avatar }: { username: string; avatar?: string | null }) {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold text-white"
      style={{ backgroundColor: avatarColor(username) }}
    >
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : username.charAt(0).toUpperCase()}
    </div>
  );
}

function ImageWithFallback({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-slate-100 px-3 py-2 text-xs text-teal-700 underline">
        查看图片
      </a>
    );
  }

  return (
    <div className="relative">
      {!loaded && <div className="h-36 w-48 animate-pulse rounded-xl bg-slate-100" />}
      <img
        src={src}
        alt=""
        className="max-h-64 max-w-full rounded-xl object-cover"
        style={{ display: loaded ? "block" : "none" }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}
