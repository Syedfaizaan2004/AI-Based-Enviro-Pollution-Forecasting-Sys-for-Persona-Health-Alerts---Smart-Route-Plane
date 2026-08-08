import { useState } from 'react';
import { AlertCircle, RotateCw, Activity, Map, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useDashboardSummary, useRecentAlerts } from '@/features/dashboard/hooks/dashboard';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { HeroSection } from '@/features/dashboard/components/HeroSection';
import { SummaryCards } from '@/features/dashboard/components/SummaryCards';
import { AQITrendChart } from '@/features/dashboard/components/AQICharts';
import { WeatherReport } from '@/features/dashboard/components/WeatherReport';
import { HealthPanel } from '@/features/dashboard/components/HealthPanel';
import { DailyForecast } from '@/features/dashboard/components/DailyForecast';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { RecentAlerts } from '@/features/dashboard/components/RecentAlerts';
import { LocationSearchBar } from '@/features/dashboard/components/LocationSearchBar';
import { MapPreview } from '@/features/dashboard/components/MapPreview';
import { SavedLocations } from '@/features/dashboard/components/SavedLocations';
import { SmartCommuteSnapshot } from '@/features/dashboard/components/SmartCommuteSnapshot';

export const Dashboard = () => {
  // Global location state (defaults will be set by LocationSearchBar on mount)
  const [location, setLocation] = useState({
    city: '',
    lat: 0,
    lon: 0,
  });
  const [activeTab, setActiveTab] = useState<'chart' | 'map'>('chart');
  
  const { data: summary, isLoading: loadingSummary, isError: errorSummary, refetch: refetchSummary } = useDashboardSummary();
  const { data: alerts, isLoading: loadingAlerts } = useRecentAlerts();

  const isLoading = loadingSummary || loadingAlerts;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (errorSummary || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          We couldn't fetch your live data. The server might be unreachable or returning an error.
        </p>
        <Button onClick={() => refetchSummary()} className="gap-2">
          <RotateCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1920px] mx-auto w-full">

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Environmental Dashboard</h1>
            {summary?.health?.current_health_profile && summary.health.current_health_profile !== 'None' && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 border border-primary/20">
                <Activity className="h-3.5 w-3.5" />
                Profile: <span className="capitalize">{summary.health.current_health_profile}</span>
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Real-time air quality and weather analytics</p>
        </div>
        <LocationSearchBar 
          onLocationSelect={(city, lat, lon) => setLocation({ city, lat, lon })} 
        />
      </div>

      {/* Saved Locations */}
      <SavedLocations location={location} />

      {/* Hero Section — shows live AQI, category, exposure */}
      <HeroSection data={summary} location={location} />

      {/* Summary Cards — shows live stats from backend */}
      <SummaryCards data={summary} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">

        {/* Left Column (Charts and Maps) */}
        <div className="lg:col-span-2 2xl:col-span-3 flex flex-col gap-6 lg:gap-8 min-h-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 shrink-0">
            {/* Live pollutant overview / Map Toggle */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center p-1 bg-muted/30 rounded-xl border border-border/50 w-fit">
                <button 
                  onClick={() => setActiveTab('chart')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'chart' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <BarChart2 className="h-4 w-4" /> AQI Trend
                </button>
                <button 
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Map className="h-4 w-4" /> Live Map
                </button>
              </div>
              {activeTab === 'chart' ? (
                <AQITrendChart location={location} />
              ) : (
                <MapPreview location={location} />
              )}
            </div>
            {/* Local Weather Report */}
            <WeatherReport location={location} />
          </div>

          {/* Full Day AQI and Weather Forecast */}
          <DailyForecast location={location} className="flex-1" />
        </div>

        {/* Right Column (Health, Actions, Alerts) */}
        <div className="space-y-6 lg:space-y-8">
          {/* Live health panel driven by backend data */}
          <HealthPanel data={summary} />
          
          <SmartCommuteSnapshot />

          <QuickActions />
          <div>
            <RecentAlerts alerts={alerts || []} />
          </div>
        </div>

      </div>
    </div>
  );
};
