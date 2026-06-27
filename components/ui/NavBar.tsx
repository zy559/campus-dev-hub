"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "推荐" },
  { href: "/activity", label: "动态" },
  { href: "/posts/new", label: "发布" },
];

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
        // 消息角标失败不影响导航。
      }
    }
    poll();
    const timer = setInterval(poll, 15000);
    return () => clearInterval(timer);
  }, [session]);

  function active(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    const keyword = q.trim();
    if (keyword) router.push(`/activity?search=${encodeURIComponent(keyword)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/85">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8" aria-label="全局导航">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-teal-400 dark:text-slate-950">
            围
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">围炉</span>
          <span className="hidden border-l border-slate-300 pl-2 text-xs text-slate-400 dark:border-white/10 xl:inline">
            找到同校同频的人
          </span>
        </Link>

        <form onSubmit={search} className="mx-6 hidden max-w-md flex-1 sm:block">
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="搜索动态、标签、用户..."
            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </form>

        <button className="rounded-lg p-2 text-slate-500 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="打开菜单">
          ☰
        </button>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition ${active(link.href) ? "text-teal-700" : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"}`}
            >
              {link.label}
            </Link>
          ))}

          {session && (
            <Link href="/messages" className={`relative text-sm font-semibold ${active("/messages") ? "text-teal-700" : "text-slate-500 hover:text-slate-950"}`}>
              消息
              {unreadCount > 0 && (
                <span className="absolute -right-4 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          <ThemeToggle />

          {session ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-white/10">
                    <div className="border-b border-slate-100 px-4 py-2 dark:border-white/10">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{session.user?.name}</p>
                      {isAdmin && <p className="text-xs text-teal-700">管理员</p>}
                    </div>
                    <MenuLink href={`/profile/${session.user?.name}`} onClick={() => setUserMenuOpen(false)}>
                      我的主页
                    </MenuLink>
                    {isAdmin && (
                      <MenuLink href="/admin" onClick={() => setUserMenuOpen(false)}>
                        管理面板
                      </MenuLink>
                    )}
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-white/5">
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-slate-900 hover:text-teal-700 dark:text-white">
              登录
            </Link>
          )}
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6 dark:bg-slate-900 lg:hidden">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold" onClick={() => setMobileOpen(false)}>
              围炉
            </Link>
            <button onClick={() => setMobileOpen(false)} className="text-2xl">
              ×
            </button>
          </div>
          <div className="space-y-2">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5">
                {link.label}
              </Link>
            ))}
            {session && (
              <Link href="/messages" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">
                消息
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">
                管理面板
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
      {children}
    </Link>
  );
}
