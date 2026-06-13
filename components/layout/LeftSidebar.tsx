"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/boards", label: "板块", icon: "📂" },
  { href: "/posts/new", label: "发帖", icon: "✍️" },
];

const AUTH_ITEMS = [
  { href: "/messages", label: "消息", icon: "💬" },
  { href: "/premium", label: "会员", icon: "💎" },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  function linkClass(href: string) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `flex items-center gap-3 px-5 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
      active
        ? "bg-accent text-white shadow-sm"
        : "text-muted hover:bg-surface-alt hover:text-ink"
    }`;
  }

  return (
    <aside className="w-[260px] flex-shrink-0 hidden lg:block pt-6">
      <nav className="sticky top-20 space-y-1 px-4">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="text-lg w-6 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {session && (
          <>
            <div className="my-3 border-t border-border" />
            {AUTH_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                <span className="text-lg w-6 text-center">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}

        {!session && (
          <div className="mt-4 p-5 rounded-xl bg-surface-alt">
            <p className="text-sm text-muted mb-3">登录后解锁更多功能</p>
            <Link
              href="/login"
              className="block text-center text-base font-medium bg-accent text-white py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
            >
              立即登录
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
