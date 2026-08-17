import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Clock, Activity, Wind, AlertTriangle, CloudRain, Thermometer, ShieldAlert, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RouteHistoryResponse } from '@/features/routes/types/route';
import { CityName } from './CityName';
import { format } from 'date-fns';

interface RouteDetailsModalProps {
  route: RouteHistoryResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RouteDetailsModal({ route, isOpen, onClose }: RouteDetailsModalProps) {
  if (!route) return null;

  // Assuming scores might be populated. If not, fallback to default structure.
  const score = route.scores?.[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-6 md:p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-0 top-0 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>

            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                <Navigation className="h-6 w-6 text-primary" />
                Smart Route Insights
              </h2>
              <p className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
                <Clock className="h-4 w-4" /> Planned on {format(new Date(route.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* Path Overview Bento */}
              <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md hover:bg-card/60">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-sm font-semibold text-primary mb-6 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Trip Journey
                </h3>
                
                <div className="space-y-6 relative z-10">
                  <div className="relative pl-8">
                    <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-muted" />
                    
                    <div className="mb-6 relative">
                      <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Departure</span>
                      <span className="text-xl font-medium text-foreground">{route.start_address || <CityName lat={route.start_lat} lng={route.start_lng} />}</span>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Arrival</span>
                      <span className="text-xl font-medium text-foreground">{route.end_address || <CityName lat={route.end_lat} lng={route.end_lng} />}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="bg-background/80 rounded-xl p-4 border border-border/30 shadow-sm flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Navigation className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium">Total Distance</div>
                        <div className="font-semibold text-lg">{route.total_distance_km.toFixed(1)} km</div>
                      </div>
                    </div>
                    <div className="bg-background/80 rounded-xl p-4 border border-border/30 shadow-sm flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium">Est. Duration</div>
                        <div className="font-semibold text-lg">{route.estimated_duration_min.toFixed(0)} min</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Air Quality Impact Bento */}
              <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md hover:bg-card/60">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-sm font-semibold text-rose-500 mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Wind className="h-4 w-4" /> Air Quality Impact
                </h3>
                
                {score ? (
                  <div className="space-y-6 relative z-10">
                    <div className="bg-gradient-to-br from-background/80 to-muted/30 rounded-xl p-5 border border-border/50 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-primary" /> Average AQI
                        </div>
                        <div className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                          {Math.round(score.average_aqi)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={score.average_aqi > 100 ? 'destructive' : score.average_aqi > 50 ? 'secondary' : 'default'}
                          className="mb-2 px-3 py-1 text-sm font-semibold"
                        >
                          {score.average_aqi > 100 ? 'Poor' : score.average_aqi > 50 ? 'Moderate' : 'Good'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">Overall Air Quality</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/80 rounded-xl p-4 border border-border/30 shadow-sm flex flex-col justify-between">
                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          <ShieldAlert className="h-4 w-4 text-amber-500" /> Max Peak AQI
                        </div>
                        <div className="font-bold text-2xl">{Math.round(score.maximum_aqi)}</div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                          <div className={`h-1.5 rounded-full ${score.maximum_aqi > 100 ? 'bg-destructive' : score.maximum_aqi > 50 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${Math.min(100, (score.maximum_aqi / 300) * 100)}%` }} />
                        </div>
                      </div>
                      
                      <div className="bg-background/80 rounded-xl p-4 border border-border/30 shadow-sm flex flex-col justify-between">
                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          <HeartPulse className="h-4 w-4 text-emerald-500" /> Smart Route Score
                        </div>
                        <div className="font-bold text-2xl text-emerald-500">{Math.round(score.smart_route_score)}<span className="text-sm font-medium text-muted-foreground ml-1">/100</span></div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${score.smart_route_score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50 relative z-10">
                    <div className="p-3 bg-background rounded-full shadow-sm mb-3">
                      <AlertTriangle className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-medium">No detailed scoring available for this route.</p>
                  </div>
                )}
              </div>

              {/* Waypoint Breakdown Bento */}
              {route.waypoints && route.waypoints.length > 0 && (
                <div className="md:col-span-2 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all hover:shadow-md hover:bg-card/60 mt-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h3 className="text-sm font-semibold text-emerald-600 mb-6 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Waypoint Breakdown
                  </h3>
                  
                  <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 snap-x">
                    {route.waypoints.map((wp, idx) => (
                      <div key={idx} className="min-w-[280px] snap-center bg-background/80 rounded-xl p-5 border border-border/30 shadow-sm flex flex-col shrink-0">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              {idx === 0 ? 'Start' : idx === route.waypoints!.length - 1 ? 'End' : `Waypoint ${idx}`}
                            </div>
                            <div className="font-medium text-lg truncate w-[160px]" title={wp.city_name || "Unknown Location"}>
                              {wp.city_name || <CityName lat={wp.latitude} lng={wp.longitude} />}
                            </div>
                          </div>
                          <Badge variant={wp.predicted_aqi > 100 ? 'destructive' : wp.predicted_aqi > 50 ? 'secondary' : 'default'} className="shadow-sm">
                            AQI {Math.round(wp.predicted_aqi)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500">
                              <Thermometer className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase">Temp</div>
                              <div className="text-sm font-semibold">{wp.temperature != null ? `${Math.round(wp.temperature)}°C` : 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-rose-500/10 rounded-md text-rose-500">
                              <CloudRain className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase">PM2.5</div>
                              <div className="text-sm font-semibold">{wp.pm25 != null ? `${Math.round(wp.pm25)} µg` : 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="md:col-span-2 pt-4 border-t border-border/50 flex justify-end">
                <Button onClick={onClose} className="rounded-xl px-6">
                  Close Details
                </Button>
              </div>
              
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
