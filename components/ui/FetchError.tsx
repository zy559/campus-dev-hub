"use client";

export default function FetchError({ message }: { message: string }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="text-5xl mb-4" aria-hidden="true">⚡</div>
      <p className="text-muted text-lg">{message}</p>
      <p className="text-subtle mt-2">请检查网络连接后刷新页面</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-all font-medium text-sm active:scale-95"
      >
        重试
      </button>
    </div>
  );
}
