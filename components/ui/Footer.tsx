export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Campus Dev Hub — 校园技术交流社区</p>
        <p className="mt-1">Built with Next.js · Deployed on Vercel</p>
      </div>
    </footer>
  );
}
