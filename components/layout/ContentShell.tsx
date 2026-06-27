"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

export default function ContentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const isBrowsing = searchParams.get("browse") === "1";
  const isLanding = pathname === "/" && !session && !isBrowsing;
  const isFullWidth = isLanding || pathname === "/login" || pathname.startsWith("/posts/new");

  if (isFullWidth) {
    return <div className="pb-24 lg:pb-0">{children}</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <LeftSidebar />
      <main className="min-w-0 flex-1 border-border pb-24 lg:border-x lg:pb-0">
        <div className="px-4 py-4 lg:px-6 lg:py-6">{children}</div>
      </main>
      <RightSidebar />
    </div>
  );
}
