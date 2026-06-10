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
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-200 mb-4">500</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">出了点问题</h2>
      <p className="text-gray-600 mb-8">服务器出了点小问题，请稍后再试。</p>
      <button
        onClick={reset}
        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
      >
        重试
      </button>
    </div>
  );
}
