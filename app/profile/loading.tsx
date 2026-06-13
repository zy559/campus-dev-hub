import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-8">
        <div className="flex items-start gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
