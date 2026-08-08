
export const RouteCardSkeleton = () => (
  <div className="h-[120px] rounded-2xl bg-muted/40 animate-pulse border border-border/50 p-4 flex flex-col justify-between">
    <div className="flex justify-between">
      <div className="space-y-2">
        <div className="h-5 w-24 bg-muted/60 rounded" />
        <div className="h-3 w-16 bg-muted/60 rounded" />
      </div>
      <div className="h-12 w-16 bg-muted/60 rounded-xl" />
    </div>
    <div className="flex gap-2">
      <div className="h-10 flex-1 bg-muted/60 rounded-lg" />
      <div className="h-10 flex-1 bg-muted/60 rounded-lg" />
    </div>
  </div>
);

export const RouteDetailsSkeleton = () => (
  <div className="h-full rounded-2xl bg-muted/20 animate-pulse border border-border/50 flex flex-col overflow-hidden">
    <div className="p-6 border-b border-border/50">
      <div className="h-6 w-40 bg-muted/40 rounded mb-2" />
      <div className="h-4 w-32 bg-muted/40 rounded" />
    </div>
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-muted/40 rounded-2xl" />
        <div className="h-24 bg-muted/40 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-40 bg-muted/40 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-muted/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
