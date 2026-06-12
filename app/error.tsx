"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4" role="alert">
      <div className="glass rounded-3xl p-12 max-w-md animate-scale-in">
        <div className="text-7xl mb-4" aria-hidden="true">⚡</div>
        <h1 className="text-3xl font-bold text-ink mb-2">出了点问题</h1>
        <p className="text-muted mb-8">
          服务器出了点小问题，请稍后再试。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full hover:bg-accent-hover transition-all duration-200 font-medium hover:shadow-lg hover:shadow-accent/25 active:scale-95"
        >
          重试
        </button>
      </div>
    </div>
  );
}
