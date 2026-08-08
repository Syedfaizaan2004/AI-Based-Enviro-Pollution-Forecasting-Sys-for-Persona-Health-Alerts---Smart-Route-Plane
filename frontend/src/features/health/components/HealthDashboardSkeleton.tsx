export const HealthDashboardSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Overview Skeleton */}
      <div className="h-[250px] md:h-[200px] rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[300px] rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
          <div className="h-[400px] rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <div className="h-[200px] rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
          <div className="h-[500px] rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
        </div>

      </div>
    </div>
  );
};
