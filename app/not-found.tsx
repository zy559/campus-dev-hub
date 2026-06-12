import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="glass rounded-3xl p-12 max-w-md animate-scale-in">
        <div className="text-7xl mb-4" aria-hidden="true">🔍</div>
        <h1 className="text-3xl font-bold text-ink mb-2">页面不存在</h1>
        <p className="text-muted mb-8">
          你访问的页面可能已被删除，或者链接地址有误。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full hover:bg-accent-hover transition-all duration-200 font-medium hover:shadow-lg hover:shadow-accent/25 active:scale-95"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
