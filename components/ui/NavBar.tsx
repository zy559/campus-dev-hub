"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?search=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索帖子、标签、用户..."
        className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
      />
    </form>
  );
}

// 桌面端导航项
const DESKTOP_LINKS = [
  { href: "/", label: "发现" },
  { href: "/boards", label: "板块" },
  { href: "/posts/new", label: "发帖" },
];

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [targetUsername, setTargetUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  // ESC 关闭所有弹出层
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileOpen(false);
      setUserMenuOpen(false);
      setImpersonateOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 移动端菜单打开时禁止背景滚动
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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

  function linkActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="bg-slate-950">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8 h-16">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
            <span className="text-xl font-bold transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              🔥
            </span>
            <span className="text-lg font-bold text-white">
              围炉
            </span>
            <span className="hidden xl:inline text-xs text-slate-500 font-normal pl-2 border-l border-white/10 ml-0.5">
              技术有温度
            </span>
          </Link>
        </div>

        {/* 搜索（桌面端） */}
        <div className="hidden sm:block flex-1 max-w-md mx-6">
          <SearchBar />
        </div>

        {/* 移动端：搜索 + 菜单按钮 */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => {
              const el = document.getElementById('mobile-search') as HTMLInputElement;
              const wrap = document.getElementById('mobile-search-wrap');
              if (el && wrap) {
                wrap.classList.toggle('hidden');
                if (!wrap.classList.contains('hidden')) el.focus();
              }
            }}
            className="rounded-md p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="搜索"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-400"
            aria-label="打开菜单"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-6">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 桌面端导航 + 右侧操作 */}
        <div className="hidden lg:flex lg:gap-x-8 lg:flex-1 lg:justify-end lg:items-center">
          {DESKTOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                linkActive(link.href)
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* 消息 */}
          {session && (
            <Link
              href="/messages"
              className={`text-sm font-semibold transition-colors ${
                linkActive("/messages") ? "text-amber-400" : "text-slate-400 hover:text-white"
              }`}
              aria-label="消息"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </Link>
          )}

          <ThemeToggle />

          {/* 用户菜单 / 登录 */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-all duration-200"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="用户菜单"
              >
                <div className="size-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm ring-2 ring-transparent hover:ring-amber-500/30 transition-all duration-300">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 ring-1 ring-white/10 shadow-xl py-1 z-20 origin-top-right animate-scale-in" role="menu">
                    <div className="px-4 py-2 border-b border-white/10" role="none">
                      <p className="text-sm font-medium text-white" role="none">{session.user?.name}</p>
                      {isAdmin && <p className="text-xs text-amber-400" role="none">管理员</p>}
                    </div>
                    <Link
                      href={`/profile/${session.user?.name}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      role="menuitem"
                    >
                      个人主页
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                          role="menuitem"
                        >
                          🛡️ 管理面板
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); setImpersonateOpen(true); }}
                          className="block w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-white/5 transition-colors"
                          role="menuitem"
                        >
                          切换用户
                        </button>
                      </>
                    )}
                    <Link
                      href="/premium"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      role="menuitem"
                    >
                      💎 升级会员
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
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
              className="text-sm font-semibold text-white hover:text-amber-300 transition-colors"
            >
              登录 <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </nav>

      {/* 移动端搜索栏（可折叠） */}
      <div id="mobile-search-wrap" className="hidden sm:hidden px-4 pb-3">
        <SearchBar />
      </div>

      {/* ========== 移动端侧滑菜单 ========== */}
      {mobileOpen && (
        <div className="lg:hidden">
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* 侧滑面板 */}
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-slate-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <span className="text-xl">🔥</span>
                <span className="text-lg font-bold text-white">围炉</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-slate-400"
                aria-label="关闭菜单"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-6">
                  <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {DESKTOP_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold transition-colors ${
                        linkActive(link.href)
                          ? "text-amber-400 bg-white/5"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {session && (
                    <Link
                      href="/messages"
                      onClick={() => setMobileOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5"
                    >
                      消息
                    </Link>
                  )}
                </div>

                <div className="py-6">
                  {session ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="size-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                          {session.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                          {isAdmin && <p className="text-xs text-amber-400">管理员</p>}
                        </div>
                      </div>
                      <Link
                        href={`/profile/${session.user?.name}`}
                        onClick={() => setMobileOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5"
                      >
                        个人主页
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5"
                        >
                          🛡️ 管理面板
                        </Link>
                      )}
                      <Link
                        href="/premium"
                        onClick={() => setMobileOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5"
                      >
                        💎 升级会员
                      </Link>
                      <button
                        onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="-mx-3 block w-full text-left rounded-lg px-3 py-2 text-base font-semibold text-red-400 hover:bg-white/5"
                      >
                        退出登录
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-white/5"
                    >
                      登录 <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 模拟登录弹窗 ========== */}
      {impersonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-slate-800 rounded-2xl ring-1 ring-white/10 shadow-xl p-6 w-full max-w-sm mx-4 animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-label="切换用户"
          >
            <h2 className="text-lg font-bold text-white mb-4">切换用户</h2>
            <form onSubmit={handleImpersonate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">输入目标用户名</label>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="用户名"
                  required
                />
                {error && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    <span aria-hidden="true">⚠️ </span>{error}
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setImpersonateOpen(false); setTargetUsername(""); setError(""); }}
                  className="px-4 py-2 text-sm text-slate-300 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm text-slate-950 bg-amber-500 rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all active:scale-95 font-semibold"
                >
                  {loading ? "切换中..." : "确认切换"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
