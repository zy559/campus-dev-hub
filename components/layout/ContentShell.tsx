"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

export default function ContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // 登录后的首页、板块页、消息页、个人主页 → 三栏
  // 未登录首页 → 全宽落地页
  const isLanding = pathname === "/" && !session;
  const isFullWidth = isLanding || pathname === "/login" || pathname.startsWith("/posts/new");

  if (isFullWidth) {
    return <>{children}</>;
  }

  return (
    <div className="flex justify-center">
      <LeftSidebar />
      <main className="flex-1 min-w-0 max-w-[760px] border-x border-border">
        {children}
      </main>
      <RightSidebar />
    </div>
  );
}
