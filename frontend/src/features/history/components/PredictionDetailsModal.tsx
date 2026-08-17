import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type PredictionHistoryResponse } from '../types/history';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { Wind, Thermometer, Droplets, Gauge, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { CityName } from './CityName';

interface PredictionDetailsModalProps {
  prediction: PredictionHistoryResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const POLLUTANT_LIMITS = {
  pm25: { limit: 12, label: 'PM2.5', unit: 'µg/m³' }, // WHO guidelines
  pm10: { limit: 45, label: 'PM10', unit: 'µg/m³' },
  o3: { limit: 100, label: 'Ozone', unit: 'µg/m³' },
  no2: { limit: 25, label: 'NO2', unit: 'µg/m³' },
  so2: { limit: 40, label: 'SO2', unit: 'µg/m³' },
  co: { limit: 4, label: 'CO', unit: 'mg/m³' },
};

export function PredictionDetailsModal({ prediction, isOpen, onClose }: PredictionDetailsModalProps) {
  if (!prediction) return null;

  const chartData = [
    { name: 'PM2.5', value: prediction.pm25, limit: POLLUTANT_LIMITS.pm25.limit, unit: 'µg/m³' },
    { name: 'PM10', value: prediction.pm10, limit: POLLUTANT_LIMITS.pm10.limit, unit: 'µg/m³' },
    { name: 'O3', value: prediction.o3, limit: POLLUTANT_LIMITS.o3.limit, unit: 'µg/m³' },
    { name: 'NO2', value: prediction.no2, limit: POLLUTANT_LIMITS.no2.limit, unit: 'µg/m³' },
    { name: 'SO2', value: prediction.so2, limit: POLLUTANT_LIMITS.so2.limit, unit: 'µg/m³' },
    // CO is typically in mg/m3 so scale might be tiny compared to others, but we'll include it
    { name: 'CO', value: prediction.co, limit: POLLUTANT_LIMITS.co.limit, unit: 'mg/m³' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-background/60 backdrop-blur-3xl border-border/50 shadow-2xl">
        {/* Animated Background Glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 border-b border-border/50 relative z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wind className="h-6 w-6 text-primary" />
                Air Quality Prediction
              </span>
              <Badge variant={
                prediction.aqi_category === 'Good' ? 'default' : 
                prediction.aqi_category === 'Moderate' ? 'secondary' : 'destructive'
              } className="text-sm px-3 py-1 shadow-sm">
                AQI {Math.round(prediction.aqi_value)} • {prediction.aqi_category}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground flex items-center gap-1">Location</span>
              {prediction.city ? prediction.city : <CityName lat={prediction.latitude} lng={prediction.longitude} />}
            </div>
            <div className="flex flex-col gap-1 sm:text-right">
              <span className="font-semibold text-foreground">Timestamp</span>
              <span>{format(new Date(prediction.prediction_timestamp), 'PPpp')}</span>
            </div>
          </div>
        </div>

        <div className="p-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bento Box: Weather Context (Span 1) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1 grid grid-cols-2 gap-3"
            >
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors group">
                <Thermometer className="h-6 w-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-muted-foreground">Temp</span>
                <span className="font-semibold text-lg">{prediction.temperature.toFixed(1)}°C</span>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors group">
                <Droplets className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-muted-foreground">Humidity</span>
                <span className="font-semibold text-lg">{prediction.humidity.toFixed(0)}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors group">
                <Wind className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-muted-foreground">Wind</span>
                <span className="font-semibold text-lg">{prediction.wind_speed?.toFixed(1) ?? '--'} m/s</span>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors group">
                <Gauge className="h-6 w-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-muted-foreground">Pressure</span>
                <span className="font-semibold text-lg">{prediction.pressure?.toFixed(0) ?? '--'} hPa</span>
              </div>
            </motion.div>

            {/* Bento Box: Pollutant Chart (Span 2) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 p-5 rounded-2xl bg-muted/30 border border-border/50 flex flex-col hover:border-primary/30 transition-colors"
            >
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                Pollutant Analysis
              </h4>
              <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/20" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isSafe = data.value <= data.limit;
                          return (
                            <div className="bg-background/95 backdrop-blur-xl border border-border/50 p-3 rounded-xl shadow-xl flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-semibold">{data.name}</p>
                                {isSafe ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-rose-500" />}
                              </div>
                              <p className="text-sm">Value: <span className="font-mono font-bold text-foreground">{data.value.toFixed(2)}</span> {data.unit}</p>
                              <p className="text-xs text-muted-foreground">WHO Limit: {data.limit} {data.unit}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > entry.limit ? '#ef4444' : '#10b981'} className="transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
