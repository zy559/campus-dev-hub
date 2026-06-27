"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  desc: string;
  icon: string;
  match?: string;
}

const DISCOVER_ITEMS: NavItem[] = [
  { href: "/", label: "\u53d1\u73b0", desc: "\u6821\u56ed\u52a8\u6001", icon: "\u25c6", match: "home" },
  { href: "/?search=%E9%81%87%E8%A7%81", label: "\u4eca\u65e5\u9047\u89c1", desc: "\u627e\u5bf9\u8c61\u3001\u642d\u5b50", icon: "\u2665", match: "\u9047\u89c1" },
  { href: "/?search=%E6%9C%BA%E4%BC%9A", label: "\u673a\u4f1a\u96f7\u8fbe", desc: "\u6d3b\u52a8\u3001\u5b9e\u4e60\u3001\u7ade\u8d5b", icon: "\u2316", match: "\u673a\u4f1a" },
  { href: "/?search=%E7%BB%84%E9%98%9F", label: "\u7ec4\u961f\u5e7f\u573a", desc: "\u6bd4\u8d5b\u548c\u9879\u76ee", icon: "\u25b2", match: "\u7ec4\u961f" },
];

const CONTENT_ITEMS: NavItem[] = [
  { href: "/boards", label: "\u5168\u90e8\u677f\u5757", desc: "\u6309\u7c7b\u627e\u5185\u5bb9", icon: "\u2630", match: "/boards" },
  { href: "/?search=%E7%9F%A5%E8%AF%86", label: "\u77e5\u8bc6\u5361", desc: "\u7ecf\u9a8c\u548c\u7b14\u8bb0", icon: "\u25a3", match: "\u77e5\u8bc6" },
  { href: "/?search=%E6%97%A5%E5%B8%B8", label: "\u6821\u56ed\u65e5\u5e38", desc: "\u751f\u6d3b\u3001\u4e8c\u624b\u3001\u6d3b\u52a8", icon: "\u25cc", match: "\u65e5\u5e38" },
];

const ACTION_ITEMS: NavItem[] = [
  { href: "/posts/new", label: "\u53d1\u5e03", desc: "\u53d1\u5e16\u6216\u540d\u7247", icon: "+", match: "/posts/new" },
  { href: "/messages", label: "\u79c1\u4fe1", desc: "\u804a\u5929\u548c\u533f\u540d\u5f00\u53e3", icon: "\u2026", match: "/messages" },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const keyword = searchParams.get("search") || "";
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="hidden w-[280px] flex-shrink-0 bg-surface-alt/50 pt-6 lg:block">
      <nav className="sticky top-20 space-y-5 pr-3">
        <div className="pl-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-subtle">Campus Hub</p>
          <p className="mt-2 text-sm leading-5 text-muted">{"\u628a\u673a\u4f1a\u3001\u4eba\u548c\u5185\u5bb9\u5206\u5f00\u627e\uff0c\u9996\u9875\u5c31\u4e0d\u4f1a\u592a\u6324\u3002"}</p>
        </div>

        <NavGroup title={"\u5feb\u901f\u53bb\u54ea"} items={DISCOVER_ITEMS} pathname={pathname} keyword={keyword} />
        <NavGroup title={"\u5185\u5bb9\u5206\u533a"} items={CONTENT_ITEMS} pathname={pathname} keyword={keyword} />

        {session ? (
          <>
            <NavGroup title={"\u6211\u7684\u884c\u52a8"} items={ACTION_ITEMS} pathname={pathname} keyword={keyword} />
            <div className="space-y-1">
              <SidebarLink
                item={{
                  href: `/profile/${session.user?.name}`,
                  label: "\u6211\u7684\u4e3b\u9875",
                  desc: "\u540d\u7247\u548c\u53d1\u5e03",
                  icon: "\u25cf",
                  match: `/profile/${session.user?.name}`,
                }}
                active={pathname.startsWith(`/profile/${session.user?.name}`)}
              />
              {isAdmin && (
                <SidebarLink
                  item={{ href: "/admin", label: "\u7ba1\u7406\u5458\u9762\u677f", desc: "\u6570\u636e\u548c\u6cbb\u7406", icon: "\u25a0", match: "/admin" }}
                  active={pathname.startsWith("/admin")}
                />
              )}
            </div>
          </>
        ) : (
          <div className="mx-3 rounded-2xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm text-muted">{"\u767b\u5f55\u540e\u89e3\u9501\u53d1\u5e03\u3001\u79c1\u4fe1\u548c\u4eca\u65e5\u9047\u89c1\u3002"}</p>
            <Link href="/login" className="block rounded-xl bg-accent py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-accent-hover">
              {"\u7acb\u5373\u767b\u5f55"}
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  keyword,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  keyword: string;
}) {
  return (
    <div className="space-y-1">
      <p className="mb-2 pl-6 text-xs font-bold text-subtle">{title}</p>
      {items.map((item) => (
        <SidebarLink key={item.href} item={item} active={isItemActive(item, pathname, keyword)} />
      ))}
    </div>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-r-2xl py-3 pl-6 pr-4 transition-all ${
        active
          ? "bg-accent text-white shadow-sm"
          : "text-muted hover:bg-surface hover:text-ink"
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
        active ? "bg-white/18 text-white" : "bg-surface text-accent ring-1 ring-border group-hover:ring-accent/20"
      }`}>
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black">{item.label}</span>
        <span className={`mt-0.5 block truncate text-xs ${active ? "text-white/75" : "text-subtle"}`}>{item.desc}</span>
      </span>
    </Link>
  );
}

function isItemActive(item: NavItem, pathname: string, keyword: string) {
  if (item.match === "home") return pathname === "/" && !keyword;
  if (!item.match) return pathname === item.href;
  if (item.match.startsWith("/")) return pathname.startsWith(item.match);
  return keyword === item.match;
}
