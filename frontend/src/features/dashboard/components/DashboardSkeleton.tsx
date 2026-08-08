import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
};
