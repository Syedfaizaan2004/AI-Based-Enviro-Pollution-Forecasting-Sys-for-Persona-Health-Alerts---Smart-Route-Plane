import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/features/dashboard/services/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

interface CityNameProps {
  lat: number;
  lng: number;
}

export function CityName({ lat, lng }: CityNameProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['reverse-geocode', lat, lng],
    queryFn: async () => {
      // Round to 3 decimal places for caching to group nearby coordinates
      const res = await dashboardService.reverseGeocode(
        Number(lat.toFixed(3)), 
        Number(lng.toFixed(3))
      );
      return res;
    },
    staleTime: 1000 * 60 * 60 * 24, // cache for 24 hours
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const displayName = data?.city || data?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  return (
    <div className="flex items-center gap-1.5 text-foreground truncate max-w-[200px]">
      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="truncate" title={displayName}>{displayName}</span>
    </div>
  );
}
