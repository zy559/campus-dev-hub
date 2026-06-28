"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  desc: string;
  icon: string;
}

const MAIN_ITEMS: NavItem[] = [
  { href: "/", label: "推荐", desc: "同频资料卡", icon: "⌂" },
  { href: "/activity", label: "动态", desc: "机会、组队、日常", icon: "◎" },
  { href: "/posts/new?type=post", label: "发动态", desc: "发布栏目内容", icon: "+" },
  { href: "/posts/new?type=card", label: "发资料卡", desc: "进入今日遇见", icon: "◇" },
  { href: "/messages", label: "聊天", desc: "私信和匿名开口", icon: "✉" },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="hidden w-[260px] flex-shrink-0 bg-white/30 pt-6 lg:block">
      <nav className="sticky top-20 space-y-5 pr-3">
        <div className="pl-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Campus Hub</p>
          <p className="mt-2 text-sm leading-5 text-slate-600">首页看推荐，动态按栏目找内容。</p>
        </div>

        <div className="space-y-1">
          {MAIN_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </div>

        {session ? (
          <div className="space-y-1">
            <p className="mb-2 pl-6 text-xs font-bold text-slate-500">我的</p>
            <SidebarLink
              item={{ href: "/me", label: "我的主页", desc: "喜欢和资料", icon: "◌" }}
              active={pathname.startsWith("/me") || pathname.startsWith(`/profile/${session.user?.name}`)}
            />
            {isAdmin && (
              <SidebarLink
                item={{ href: "/admin", label: "管理面板", desc: "数据和治理", icon: "□" }}
                active={pathname.startsWith("/admin")}
              />
            )}
          </div>
        ) : (
          <div className="mx-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm text-slate-600">登录后解锁发布、私信和推荐互动。</p>
            <Link href="/login" className="block rounded-xl bg-teal-600 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-teal-500">
              立即登录
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 rounded-r-2xl py-3 pl-6 pr-4 transition-all ${
        active ? "bg-teal-600 text-white shadow-sm" : "text-slate-700 hover:bg-white hover:text-slate-950"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          active ? "bg-white/20 text-white" : "bg-white text-teal-700 ring-1 ring-slate-200 group-hover:ring-teal-200"
        }`}
      >
        {item.icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black">{item.label}</span>
        <span className={`mt-0.5 block truncate text-xs ${active ? "text-white/80" : "text-slate-500"}`}>{item.desc}</span>
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  if (href === "/") return pathname === "/";
  if (path === "/posts/new") return pathname.startsWith("/posts/new");
  return pathname.startsWith(path);
}
