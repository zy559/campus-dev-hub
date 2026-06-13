"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

export default function ContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLanding = pathname === "/" && !session;
  const isFullWidth = isLanding || pathname === "/login" || pathname.startsWith("/posts/new");

  if (isFullWidth) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <LeftSidebar />
      <main className="flex-1 min-w-0 border-x border-border">
        <div className="py-6 px-6">
          {children}
        </div>
      </main>
      <RightSidebar />
    </div>
  );
}
