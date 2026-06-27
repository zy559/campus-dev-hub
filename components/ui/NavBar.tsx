"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "发现" },
  { href: "/boards", label: "板块" },
  { href: "/posts/new", label: "发布" },
];

function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const keyword = q.trim();
    if (keyword) router.push(`/?search=${encodeURIComponent(keyword)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="搜索帖子、标签、用户..."
        className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-amber-500/50 dark:focus:ring-amber-500/20"
      />
    </form>
  );
}

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
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (!session) return;

    async function poll() {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) return;
        const data = await res.json();
        const total = Array.isArray(data)
          ? data.reduce((sum: number, item: { unreadCount?: number }) => sum + (item.unreadCount || 0), 0)
          : 0;
        setUnreadCount(total);
      } catch {
        // 消息角标失败不影响导航使用。
      }
    }

    poll();
    const timer = setInterval(poll, 15000);
    return () => clearInterval(timer);
  }, [session]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setMobileOpen(false);
      setUserMenuOpen(false);
      setImpersonateOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleImpersonate(event: React.FormEvent) {
    event.preventDefault();
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
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80">
      <nav aria-label="全局导航" className="mx-auto flex h-16 max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 flex items-center gap-2 p-1.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white transition-transform group-hover:scale-105 dark:bg-amber-400 dark:text-slate-950">
              围
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">围炉</span>
            <span className="ml-0.5 hidden border-l border-slate-300 pl-2 text-xs font-normal text-slate-400 dark:border-white/10 dark:text-slate-500 xl:inline">
              找到同校同频的人
            </span>
          </Link>
        </div>

        <div className="hidden max-w-md flex-1 sm:block lg:mx-6">
          <SearchBar />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={() => {
              const input = document.getElementById("mobile-search") as HTMLInputElement | null;
              const wrap = document.getElementById("mobile-search-wrap");
              if (input && wrap) {
                wrap.classList.toggle("hidden");
                if (!wrap.classList.contains("hidden")) input.focus();
              }
            }}
            className="rounded-md p-2 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            aria-label="搜索"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button type="button" onClick={() => setMobileOpen(true)} className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-500 dark:text-slate-400" aria-label="打开菜单">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-6">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="hidden items-center gap-x-8 lg:flex lg:flex-1 lg:justify-end">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-semibold transition-colors ${linkActive(link.href) ? "text-blue-600 dark:text-amber-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
              {link.label}
            </Link>
          ))}

          {session && <MessageLink active={linkActive("/messages")} unreadCount={unreadCount} />}
          <ThemeToggle />
          {session ? (
            <UserMenu
              isAdmin={isAdmin}
              userName={session.user?.name}
              open={userMenuOpen}
              setOpen={setUserMenuOpen}
              openImpersonate={() => setImpersonateOpen(true)}
            />
          ) : (
            <Link href="/login" className="text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-amber-300">
              登录 <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </nav>

      <div id="mobile-search-wrap" className="hidden px-4 pb-3 sm:hidden">
        <SearchBar />
      </div>

      {mobileOpen && (
        <MobileMenu
          isAdmin={isAdmin}
          userName={session?.user?.name}
          session={Boolean(session)}
          linkActive={linkActive}
          close={() => setMobileOpen(false)}
        />
      )}

      {impersonateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm dark:bg-black/50">
          <div className="mx-4 w-full max-w-sm animate-scale-in rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-white/10" role="dialog" aria-modal="true" aria-label="切换用户">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">切换用户</h2>
            <form onSubmit={handleImpersonate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-500 dark:text-slate-400">输入目标用户名</label>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(event) => setTargetUsername(event.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-amber-500/50 dark:focus:ring-amber-500/20"
                  placeholder="用户名"
                  required
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setImpersonateOpen(false); setTargetUsername(""); setError(""); }} className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                  取消
                </button>
                <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400">
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

function MessageLink({ active, unreadCount }: { active: boolean; unreadCount: number }) {
  return (
    <Link href="/messages" className={`relative text-sm font-semibold transition-colors ${active ? "text-blue-600 dark:text-amber-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`} aria-label="消息">
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function UserMenu({ isAdmin, userName, open, setOpen, openImpersonate }: { isAdmin: boolean; userName?: string | null; open: boolean; setOpen: (open: boolean) => void; openImpersonate: () => void }) {
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 transition-opacity hover:opacity-80" aria-expanded={open} aria-haspopup="true" aria-label="用户菜单">
        <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-2 ring-transparent transition-all hover:ring-blue-200 dark:bg-amber-500 dark:text-slate-950 dark:hover:ring-amber-500/30">
          {userName?.charAt(0).toUpperCase() || "U"}
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right animate-scale-in rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-white/10" role="menu">
            <div className="border-b border-slate-100 px-4 py-2 dark:border-white/10">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
              {isAdmin && <p className="text-xs text-blue-600 dark:text-amber-400">管理员</p>}
            </div>
            <MenuLink href={`/profile/${userName}`} onClick={() => setOpen(false)}>个人主页</MenuLink>
            {isAdmin && (
              <>
                <MenuLink href="/admin" onClick={() => setOpen(false)}>管理面板</MenuLink>
                <button onClick={() => { setOpen(false); openImpersonate(); }} className="block w-full px-4 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-slate-50 dark:text-amber-400 dark:hover:bg-white/5">
                  切换用户
                </button>
              </>
            )}
            <MenuLink href="/premium" onClick={() => setOpen(false)}>升级会员</MenuLink>
            <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }} className="block w-full px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MobileMenu({ isAdmin, userName, session, linkActive, close }: { isAdmin: boolean; userName?: string | null; session: boolean; linkActive: (href: string) => boolean; close: () => void }) {
  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm dark:bg-black/50" onClick={close} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 dark:bg-slate-900 sm:max-w-sm sm:ring-1 sm:ring-slate-200 dark:sm:ring-white/10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={close}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-amber-400 dark:text-slate-950">围</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">围炉</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={close} className="-m-2.5 rounded-md p-2.5 text-slate-500 dark:text-slate-400" aria-label="关闭菜单">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-6">
                <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-slate-200 dark:divide-white/10">
            <div className="space-y-2 py-6">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={close} className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold ${linkActive(link.href) ? "bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-amber-400" : "text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5"}`}>
                  {link.label}
                </Link>
              ))}
              {session && <MobileLink href="/messages" onClick={close}>消息</MobileLink>}
            </div>

            <div className="py-6">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white dark:bg-amber-500 dark:text-slate-950">
                      {userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                      {isAdmin && <p className="text-xs text-blue-600 dark:text-amber-400">管理员</p>}
                    </div>
                  </div>
                  <MobileLink href={`/profile/${userName}`} onClick={close}>个人主页</MobileLink>
                  {isAdmin && <MobileLink href="/admin" onClick={close}>管理面板</MobileLink>}
                  <MobileLink href="/premium" onClick={close}>升级会员</MobileLink>
                  <button onClick={() => { close(); signOut({ callbackUrl: "/" }); }} className="-mx-3 block w-full rounded-lg px-3 py-2 text-left text-base font-semibold text-red-500 hover:bg-slate-50 dark:hover:bg-white/5">
                    退出登录
                  </button>
                </div>
              ) : (
                <MobileLink href="/login" onClick={close}>登录 →</MobileLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5">
      {children}
    </Link>
  );
}
