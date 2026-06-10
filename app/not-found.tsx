import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">页面不存在</h2>
      <p className="text-gray-600 mb-8">
        你访问的页面可能已被删除，或者链接地址有误。
      </p>
      <Link
        href="/"
        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
      >
        返回首页
      </Link>
    </div>
  );
}
