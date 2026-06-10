import { PostCardSkeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}
