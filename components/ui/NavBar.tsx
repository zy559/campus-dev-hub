"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [targetUsername, setTargetUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setImpersonateOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    if (menuOpen || impersonateOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen, impersonateOpen, handleKeyDown]);

  async function handleImpersonate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: targetUsername }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "操作失败");
      return;
    }

    setImpersonateOpen(false);
    setTargetUsername("");
    router.refresh();
    window.location.href = "/";
  }

  function navClass(href: string) {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `relative text-sm font-medium transition-colors duration-200 px-1 py-0.5 ${
      isActive
        ? "text-accent"
        : "text-muted hover:text-accent"
    }`;
  }

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold text-accent transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
            💻
          </span>
          <span className="text-lg font-bold text-ink hidden sm:inline">
            Campus Dev Hub
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          <Link href="/" className={navClass("/")}>
            发现
          </Link>
          <Link href="/posts/new" className={navClass("/posts/new")}>
            发帖
          </Link>

          <div className="ml-1">
            <ThemeToggle />
          </div>

          {session ? (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-all duration-200"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="用户菜单"
              >
                <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm ring-2 ring-transparent hover:ring-accent-subtle transition-all duration-300">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-xl py-1 z-20 animate-scale-in"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-border" role="none">
                      <p className="text-sm font-medium text-ink" role="none">
                        {session.user?.name}
                      </p>
                      {isAdmin && (
                        <p className="text-xs text-accent" role="none">管理员</p>
                      )}
                    </div>
                    <Link
                      href={`/profile/${session.user?.name}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                      role="menuitem"
                    >
                      个人主页
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setImpersonateOpen(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-accent hover:bg-surface-alt transition-colors"
                        role="menuitem"
                      >
                        切换用户
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-surface-alt transition-colors"
                      role="menuitem"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-full hover:bg-accent-hover transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 active:scale-95 ml-1"
            >
              登录
            </Link>
          )}
        </div>
      </div>

      {/* 模拟登录弹窗 */}
      {impersonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="glass rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-label="切换用户"
          >
            <h2 className="text-lg font-bold text-ink mb-4">切换用户</h2>
            <form onSubmit={handleImpersonate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  输入目标用户名
                </label>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="用户名"
                  required
                />
                {error && (
                  <p className="mt-1 text-sm text-error" role="alert">
                    <span aria-hidden="true">⚠️ </span>{error}
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setImpersonateOpen(false);
                    setTargetUsername("");
                    setError("");
                  }}
                  className="px-4 py-2 text-sm text-muted bg-surface-alt rounded-xl hover:bg-border transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-white bg-accent rounded-xl hover:bg-accent-hover disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? "切换中..." : "确认切换"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
