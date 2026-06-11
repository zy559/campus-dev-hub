export default function Footer() {
  return (
    <footer className="bg-[#fafaf9] border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-[#6e6e73]">
        <p>© {new Date().getFullYear()} Campus Dev Hub — 校园技术交流社区</p>
        <p className="mt-1">Built with Next.js · Deployed on Vercel</p>
      </div>
    </footer>
  );
}
