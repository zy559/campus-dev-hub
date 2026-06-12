export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-muted">
        <p>
          © {new Date().getFullYear()} Campus Dev Hub — 校园技术交流社区
        </p>
        <p className="mt-1.5 text-subtle">
          Built by students, for students.
        </p>
      </div>
    </footer>
  );
}
