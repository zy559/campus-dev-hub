import { Suspense } from "react";
import ActivityFeed from "@/components/layout/ActivityFeed";
import { PostCardSkeleton } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";

export default function ActivityPage({
  searchParams,
}: {
  searchParams: { tag?: string; search?: string; browse?: string };
}) {
  return (
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityFeed
        tag={searchParams.tag}
        search={searchParams.search || ""}
        isBrowsing={searchParams.browse === "1"}
      />
    </Suspense>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4 py-6">
      <div className="h-32 animate-pulse rounded-[1.75rem] bg-slate-100" />
      <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}
