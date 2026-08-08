import { Shield, Wind, Droplets, ChevronRight, Activity, MapPin, Zap, MessageCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import type { RecommendedRoute } from '../types/route';

interface RouteDetailsProps {
  route: RecommendedRoute;
  onSelectRoute: (route: RecommendedRoute) => void;
  isSelecting: boolean;
}

export const RouteDetails = ({ route, onSelectRoute, isSelecting }: RouteDetailsProps) => {
  if (!route || !route.waypoints || route.waypoints.length === 0) {
    return (
      <GlassCard className="flex flex-col h-full items-center justify-center bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl p-8 text-center gap-3">
        <MapPin className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-semibold text-foreground/70">No Route Selected</p>
        <p className="text-sm text-muted-foreground">Select a route from the list to see detailed analysis.</p>
      </GlassCard>
    );
  }

  const handleWhatsAppShare = () => {
    const origin = route.waypoints[0].city_name && route.waypoints[0].city_name !== 'Unknown' 
      ? route.waypoints[0].city_name 
      : 'Current Location';
    const dest = route.waypoints[route.waypoints.length - 1].city_name && route.waypoints[route.waypoints.length - 1].city_name !== 'Unknown'
      ? route.waypoints[route.waypoints.length - 1].city_name
      : 'Destination';

    const wps = route.waypoints;
    const originCoords = `${wps[0].latitude},${wps[0].longitude}`;
    const destCoords = `${wps[wps.length - 1].latitude},${wps[wps.length - 1].longitude}`;
    
    // Sample up to 8 intermediate waypoints to force the route path on Google Maps
    const intermediateWps = [];
    if (wps.length > 2) {
      const step = Math.max(1, Math.floor((wps.length - 2) / 8));
      for (let i = 1; i < wps.length - 1; i += step) {
        intermediateWps.push(`${wps[i].latitude},${wps[i].longitude}`);
        if (intermediateWps.length >= 8) break;
      }
    }
    
    const waypointsParam = intermediateWps.length > 0 ? `&waypoints=${intermediateWps.join('|')}` : '';
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}${waypointsParam}`;

    const text = `🚗 *My Smart Route Plan*\n📍 From: ${origin}\n🏁 To: ${dest}\n⏱️ Travel Time: ${route.travel_time_min} mins\n🌍 Average AQI: ${Math.round(route.scores.average_aqi)} (${route.health_recommendation_level})\n\n🗺️ *Open in Google Maps:*\n${mapUrl}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <GlassCard className="flex flex-col h-full bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="p-5 md:p-6 border-b border-border/50 relative z-10 flex-shrink-0">
        <h2 className="text-xl font-bold tracking-tight mb-2">Route Analysis</h2>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-emerald-500" />
          {route.health_recommendation_level}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-8 relative z-10 hide-scrollbar">
        
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex flex-col items-center text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Destination AQI</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">{Math.round(route.waypoints[route.waypoints.length - 1].predicted_aqi)}</span>
              <span className="text-sm text-muted-foreground">AQI</span>
            </div>
          </div>
          <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl flex flex-col items-center text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Destination Temp</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-primary">{Math.round(route.scores.average_temperature)}</span>
              <span className="text-sm text-muted-foreground">°C</span>
            </div>
          </div>
        </div>

        {/* Detailed Pollutants & Weather */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> 
            Environmental Factors
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Wind className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">PM2.5 Avg</p>
                <p className="font-bold">{route.scores.average_pm25.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">µg/m³</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Wind className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">PM10 Avg</p>
                <p className="font-bold">{route.scores.average_pm10.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">µg/m³</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Rainy</p>
                <p className="font-bold">{route.scores.is_rainy ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Droplets className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Humidity</p>
                <p className="font-bold">{route.scores.average_humidity.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Waypoints Timeline Preview */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> 
            Journey Hotspots
          </h3>
          <div className="relative border-l-2 border-border/50 ml-3 pl-5 py-2 space-y-4">
            {route.waypoints.filter((_, i) => i % Math.max(1, Math.floor(route.waypoints.length / 3)) === 0).map((wp, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background ${
                  wp.predicted_aqi <= 50 ? 'bg-emerald-500' :
                  wp.predicted_aqi <= 100 ? 'bg-amber-500' :
                  wp.predicted_aqi <= 150 ? 'bg-orange-500' : 'bg-destructive'
                }`} />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{wp.travel_time_from_start_min === 0 ? "Start" : `${wp.travel_time_from_start_min.toFixed(0)} min`}</p>
                    <p className="text-xs text-muted-foreground">{wp.city_name && wp.city_name !== 'Unknown' ? wp.city_name : 'En route'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">AQI {Math.round(wp.predicted_aqi)}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">{wp.aqi_category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="p-5 md:p-6 border-t border-border/50 mt-auto bg-background/40 relative z-10 shrink-0 flex flex-col gap-3">
        <Button 
          className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
          onClick={() => onSelectRoute(route)}
          disabled={isSelecting}
        >
          {isSelecting ? (
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse" /> Finalizing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Start Navigation <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <Button 
          variant="outline"
          className="w-full h-11 rounded-xl text-sm border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
          onClick={handleWhatsAppShare}
        >
          <span className="flex items-center gap-2 font-semibold">
            <MessageCircle className="h-4 w-4" /> Share to WhatsApp
          </span>
        </Button>
      </div>

    </GlassCard>
  );
};
