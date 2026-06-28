import { Suspense } from "react";
import { PostCardSkeleton } from "@/components/ui/Skeleton";
import LandingHero from "./LandingHero";
import LandingShowcase from "./LandingShowcase";
import AboutContact from "./AboutContact";
import Spotlight from "@/components/ui/Spotlight";
import DataFeed from "./DataFeed";

export default function BrowseOrFeed({
  session,
  isBrowsing,
  tag,
  search,
  viewer,
}: {
  session: boolean;
  isBrowsing: boolean;
  tag?: string;
  search: string;
  viewer?: { id: string; role: string };
}) {
  if (session || isBrowsing) {
    return (
      <Suspense fallback={<FeedSkeleton />}>
        <DataFeed tag={tag} search={search} isBrowsing={isBrowsing && !session} viewer={viewer} />
      </Suspense>
    );
  }

  return (
    <Spotlight>
      <LandingHero />
      <Suspense fallback={<ShowcaseSkeleton />}>
        <LandingShowcase />
      </Suspense>
      <AboutContact />
    </Spotlight>
  );
}

function ShowcaseSkeleton() {
  return (
    <div className="bg-[#FAFAFA] dark:bg-slate-950 py-24 border-t border-slate-200/60 dark:border-white/5">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8 animate-pulse">
        <div className="flex justify-center mb-6"><div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" /></div>
        <div className="mx-auto max-w-lg"><div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto max-w-sm" /></div>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="lg:row-span-2 rounded-lg bg-slate-200 dark:bg-slate-800 min-h-[360px]" />
          <div className="rounded-lg bg-slate-200 dark:bg-slate-800 min-h-[180px]" />
          <div className="rounded-lg bg-slate-200 dark:bg-slate-800 min-h-[180px]" />
          <div className="lg:row-span-2 rounded-lg bg-slate-200 dark:bg-slate-800 min-h-[360px]" />
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="py-6">
      <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-16 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-4"><PostCardSkeleton /><PostCardSkeleton /><PostCardSkeleton /></div>
    </div>
  );
}
