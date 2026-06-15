import { Suspense } from "react";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import LandingHero from "./LandingHero";
import DataFeed, { LandingPostSection } from "./DataFeed";

export default function BrowseOrFeed({
  session,
  isBrowsing,
  tag,
  search,
}: {
  session: boolean;
  isBrowsing: boolean;
  tag?: string;
  search: string;
}) {
  // Logged-in or browsing: show data immediately (with streaming fallback)
  if (session || isBrowsing) {
    return (
      <Suspense fallback={<FeedSkeleton />}>
        <DataFeed tag={tag} search={search} isBrowsing={isBrowsing && !session} />
      </Suspense>
    );
  }

  // Landing page: hero (with tech + daily scroll) + post feed
  return (
    <>
      <LandingHero />
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Suspense fallback={<FeedSkeleton />}>
          <LandingPostSection />
        </Suspense>
      </div>
    </>
  );
}

function FeedSkeleton() {
  return (
    <div className="py-6">
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-9 w-16 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}
