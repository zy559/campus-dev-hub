"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toMarkdownContent } from "@/lib/postMedia";

interface PostContentProps {
  content: string;
}

function SafeImage({ alt, src }: { alt?: string; src?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <a
        href={src || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-accent underline transition-colors"
      >
        📷 {alt || "查看图片"}
      </a>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className="max-w-full h-auto rounded-lg"
      onError={() => setFailed(true)}
    />
  );
}

export default function PostContent({ content }: PostContentProps) {
  const markdownContent = toMarkdownContent(content);

  return (
    <div className="prose prose-orange max-w-none prose-headings:text-ink prose-p:text-muted prose-a:text-accent prose-code:text-pink-600 prose-pre:bg-gray-900 prose-pre:text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => <SafeImage src={src} alt={alt} />,
          video: ({ src }) => (
            <video src={src} controls className="max-w-full rounded-lg" preload="metadata" />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}
