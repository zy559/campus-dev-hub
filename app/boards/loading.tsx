import { PostCardSkeleton } from "@/components/ui/Skeleton";

export default function BoardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="flex gap-2 mt-4">
        <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div className="space-y-4 mt-6">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}
