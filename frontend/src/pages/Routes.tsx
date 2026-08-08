import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouteStore } from '@/features/routes/store/routeStore';
import { useRecommendRoutes, useSelectRoute, useDirections } from '@/features/routes/hooks/useRoutes';
import { SearchForm } from '@/features/routes/components/SearchForm';
import { RouteMap } from '@/features/routes/components/RouteMap';
import { RouteCard } from '@/features/routes/components/RouteCard';
import { RouteDetails } from '@/features/routes/components/RouteDetails';
import { LiveNavigationPanel } from '@/features/routes/components/LiveNavigationPanel';
import { RouteCardSkeleton, RouteDetailsSkeleton } from '@/features/routes/components/RouteSkeleton';
import type { RouteSearchValues } from '@/features/routes/validation/route';
import type { RouteRecommendResponse, RecommendedRoute } from '@/features/routes/types/route';
import { ShieldCheck } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/apiError';
import type { DistanceMatrixResponse } from '@/features/routes/types/route';
import { useDistanceMatrix } from '@/features/routes/hooks/useRoutes';
import { useEffect, useRef } from 'react';

export const Routes = () => {
  const { selectedRoute, setSelectedRoute } = useRouteStore();
  const { mutateAsync: recommendRoutes, isPending: isRecommending } = useRecommendRoutes();
  const { mutateAsync: selectRoute, isPending: isSelecting } = useSelectRoute();
  const { mutateAsync: getDirections, isPending: isPreviewing } = useDirections();
  
  const [routeResults, setRouteResults] = useState<RouteRecommendResponse | null>(null);
  const [previewRoute, setPreviewRoute] = useState<RecommendedRoute | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<DistanceMatrixResponse | null>(null);
  
  const userLocRef = useRef<{lat: number, lng: number} | null>(null);
  const { mutateAsync: getDistanceMatrix } = useDistanceMatrix();

  // Geolocation tracking
  useEffect(() => {
    let watchId: number;
    if (isNavigating && selectedRoute && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          userLocRef.current = newLoc;
          setUserLocation(newLoc);
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation(null);
      setLiveMetrics(null);
      userLocRef.current = null;
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, selectedRoute]);

  // ETA Polling
  useEffect(() => {
    if (!isNavigating || !selectedRoute) return;

    const fetchETA = async () => {
      const loc = userLocRef.current;
      if (!loc) return;
      
      const destWaypoint = selectedRoute.waypoints[selectedRoute.waypoints.length - 1];
      try {
        const res = await getDistanceMatrix({
          origins: `${loc.lat},${loc.lng}`,
          destinations: `${destWaypoint.latitude},${destWaypoint.longitude}`
        });
        setLiveMetrics(res);
      } catch (err) {
        console.error("Failed to fetch live ETA", err);
      }
    };

    // Initial fetch shortly after navigation starts
    const initialTimeout = setTimeout(fetchETA, 2000);
    // Poll every 30 seconds
    const intervalId = setInterval(fetchETA, 30000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [isNavigating, selectedRoute, getDistanceMatrix]);

  // Find nearest AQI waypoint based on user location
  const getNearestAqi = () => {
    if (!userLocation || !selectedRoute) return { aqi: null, category: null };
    
    let minDistance = Infinity;
    let nearestWp = selectedRoute.waypoints[0];
    
    for (const wp of selectedRoute.waypoints) {
      // Simple euclidean approximation for finding the nearest waypoint
      const d = Math.pow(wp.latitude - userLocation.lat, 2) + Math.pow(wp.longitude - userLocation.lng, 2);
      if (d < minDistance) {
        minDistance = d;
        nearestWp = wp;
      }
    }
    return { aqi: nearestWp.predicted_aqi, category: nearestWp.aqi_category };
  };

  const handleSearch = async (values: RouteSearchValues) => {
    try {
      // Create full ISO string with 'Z' as required by backend
      const travelDatetime = `${values.travelDate}T${values.travelTime}:00Z`;
      
      const response = await recommendRoutes({
        source: values.source,
        destination: values.destination,
        travel_datetime: travelDatetime,
        health_condition: values.healthCondition === 'none' ? undefined : values.healthCondition,
      });

      setRouteResults(response);
      setPreviewRoute(null);
      setSelectedRoute(response.best_route); // Automatically select the best route
      
      toast.success("Routes optimized successfully!");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to find routes"));
    }
  };

  const handlePreview = async (source: string, destination: string) => {
    try {
      setRouteResults(null);
      setSelectedRoute(null);
      const res = await getDirections({ source, destination });
      if (res.routes && res.routes.length > 0) {
        const route = res.routes[0];
        const dummyPreview: RecommendedRoute = {
          rank: 0,
          recommendation_reason: 'Fast Preview',
          health_recommendation_level: 'Unknown',
          travel_time_min: Math.round(route.duration_value / 60),
          distance_km: route.distance_value / 1000,
          scores: { average_aqi: -1 } as any, // -1 signals preview to RouteMap
          waypoints: route.waypoints.map(wp => ({
            latitude: wp.lat,
            longitude: wp.lng,
            predicted_aqi: -1,
            aqi_category: 'Unknown',
            health_risk: 'Unknown',
            travel_time_from_start_min: 0,
          })),
          polyline: route.polyline
        };
        setPreviewRoute(dummyPreview);
        setSelectedRoute(dummyPreview);
      }
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to load preview"));
    }
  };

  const handleSelectRoute = async (route: any) => {
    try {
      // Attempt to save the selected route to the backend for history/exposure tracking
      await selectRoute(route);
    } catch (error: any) {
      console.warn("Failed to save route to backend history, but starting navigation anyway", error);
      // We intentionally do not block navigation if the user isn't logged in or the backend fails
    }
    
    setIsNavigating(true);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-background/90 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-border/50 pointer-events-auto flex items-center gap-4`}>
        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Navigation Started</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your healthy route is ready. Drive safe!</p>
        </div>
      </div>
    ), { duration: 4000, position: 'top-center' });
  };

  const allRoutes = routeResults ? [routeResults.best_route, ...routeResults.alternative_routes] : [];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row max-w-[1920px] mx-auto overflow-hidden relative z-0">
      
      {/* Left Sidebar - Search & Results List */}
      <motion.div 
        initial={false}
        animate={{ width: isNavigating ? 0 : 'auto', opacity: isNavigating ? 0 : 1 }}
        className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col h-full bg-background/40 border-r border-border/50 relative z-20 overflow-hidden"
      >
        <div className="p-4 md:p-6 pb-2 min-w-[350px]">
          <SearchForm 
            onSubmit={handleSearch} 
            onPreview={handlePreview}
            isLoading={isRecommending} 
            isPreviewing={isPreviewing}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 hide-scrollbar space-y-4">
          {isRecommending && (
            <div className="space-y-4 mt-4">
              <RouteCardSkeleton />
              <RouteCardSkeleton />
              <RouteCardSkeleton />
            </div>
          )}

          {!isRecommending && allRoutes.length > 0 && (
            <div className="space-y-4 mt-2 pb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">Alternative Routes</h3>
              {allRoutes.map((route, idx) => (
                <div key={route.route_id || idx} className="h-36">
                  <RouteCard 
                    route={route} 
                    isSelected={selectedRoute === route}
                    onClick={() => setSelectedRoute(route)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area - Map & Route Details */}
      <div className="flex-1 flex flex-col h-[50vh] md:h-full relative bg-muted/20 z-0">
        
        {/* The Map spans the entire background */}
        <div className="absolute inset-0 z-0 p-4 md:p-6 pb-0 md:pb-6">
          <RouteMap 
            routes={previewRoute && !routeResults ? [previewRoute] : allRoutes} 
            selectedRoute={selectedRoute} 
            onSelectRoute={setSelectedRoute} 
            isNavigating={isNavigating}
            userLocation={userLocation}
          />
        </div>

        {/* Floating Stop Navigation Button */}
        <AnimatePresence>
          {isNavigating && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-6 left-6 z-10"
              >
                <button 
                  onClick={() => setIsNavigating(false)}
                  className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl border border-border/50 text-sm font-semibold flex items-center gap-2 hover:bg-background transition-colors text-destructive"
                >
                  Stop Navigation
                </button>
              </motion.div>
              
              <LiveNavigationPanel 
                liveMetrics={liveMetrics} 
                currentAqi={getNearestAqi().aqi} 
                currentAqiCategory={getNearestAqi().category}
              />
            </>
          )}
        </AnimatePresence>

        {/* Route Details Overlaid on the Map */}
        <AnimatePresence mode="wait">
          {selectedRoute && !isNavigating && !previewRoute && (
            <motion.div
              key={selectedRoute.route_id || selectedRoute.rank}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-6 right-6 bottom-6 w-[350px] lg:w-[400px] z-10 hidden md:block"
            >
              <RouteDetails 
                route={selectedRoute} 
                onSelectRoute={handleSelectRoute}
                isSelecting={isSelecting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isRecommending && (
          <div className="absolute top-6 right-6 bottom-6 w-[350px] lg:w-[400px] z-10 hidden md:block">
            <RouteDetailsSkeleton />
          </div>
        )}

      </div>
    </div>
  );
};
