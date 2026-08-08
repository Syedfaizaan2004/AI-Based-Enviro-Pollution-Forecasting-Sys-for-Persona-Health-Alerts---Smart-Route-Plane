import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Clock, Target, Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedAQIGauge } from './AnimatedAQIGauge';
import { PollutantCards } from './PollutantCards';
import { AIInsightsPanel } from './AIInsightsPanel';
import type { PredictionResponse } from '../types/prediction';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const PredictionResult = ({ data }: { data: PredictionResponse[] | null }) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);

  if (!data || data.length === 0) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center p-12 text-center bg-background/40 backdrop-blur-xl border-border/30 border-dashed">
        <BrainCircuit className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-foreground/80">Awaiting Input</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Fill out the prediction form on the left and our AI ensemble model will generate a high-confidence forecast.
        </p>
      </GlassCard>
    );
  }

  // Ensure index doesn't go out of bounds if a new prediction is fetched
  const safeIndex = selectedHourIndex >= data.length ? 0 : selectedHourIndex;
  const selectedData = data[safeIndex];

  const chartData = data.map((d, index) => ({
    time: format(new Date(d.prediction_timestamp), 'HH:mm'),
    aqi: Math.round(d.predicted_aqi),
    pm25: Math.round(d.pm25),
    pm10: Math.round(d.pm10),
    index
  }));

  return (
    <GlassCard className="p-6 md:p-8 bg-background/60 backdrop-blur-xl border-border/50 h-full relative overflow-y-auto">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-bold tracking-tight">Forecast Results</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-medium">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(selectedData.prediction_timestamp), 'PPp')}</span>
            <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {(selectedData.confidence_score * 100).toFixed(1)}% Confidence</span>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Ensemble Model v{selectedData.ensemble_version}</span>
        </motion.div>
      </div>

      {/* Forecast Timeline Chart */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">6-Hour Trend (AQI, PM2.5, PM10)</h3>
          <span className="text-xs text-muted-foreground ml-2">(Click chart to view hour details)</span>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              onClick={(e) => {
                if (e && typeof e.activeTooltipIndex === 'number') {
                  setSelectedHourIndex(e.activeTooltipIndex);
                }
              }}
            >
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPm10" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary)/0.5)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs font-medium space-y-1.5">
                        <p className="text-muted-foreground mb-2">{payload[0].payload.time}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="flex items-center gap-2 justify-between" style={{ color: entry.color }}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span>{entry.value}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              <Area 
                name="AQI"
                type="monotone" 
                dataKey="aqi" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAqi)" 
                activeDot={{ r: 6, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Area 
                name="PM2.5"
                type="monotone" 
                dataKey="pm25" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPm25)" 
                activeDot={{ r: 4 }}
              />
              <Area 
                name="PM10"
                type="monotone" 
                dataKey="pm10" 
                stroke="#eab308" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPm10)" 
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Data Table */}
      <div className="mb-8 overflow-x-auto rounded-xl border border-border/50 bg-background/30 backdrop-blur-md">
        <table className="w-full text-sm text-left text-muted-foreground whitespace-nowrap">
          <thead className="text-xs uppercase bg-muted/50 text-foreground/80 border-b border-border/50">
            <tr>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">AQI</th>
              <th className="px-4 py-3 font-semibold">PM2.5</th>
              <th className="px-4 py-3 font-semibold">PM10</th>
              <th className="px-4 py-3 font-semibold">SO2</th>
              <th className="px-4 py-3 font-semibold">NO2</th>
              <th className="px-4 py-3 font-semibold">Temp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, idx) => (
              <tr 
                key={idx} 
                className={`border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${idx === safeIndex ? 'bg-primary/5' : ''}`}
                onClick={() => setSelectedHourIndex(idx)}
              >
                <td className="px-4 py-3 font-medium text-foreground">{format(new Date(d.prediction_timestamp), 'HH:mm')}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{Math.round(d.predicted_aqi)}</td>
                <td className="px-4 py-3">{d.pm25.toFixed(1)}</td>
                <td className="px-4 py-3">{d.pm10.toFixed(1)}</td>
                <td className="px-4 py-3">{d.so2?.toFixed(1) || '0.0'}</td>
                <td className="px-4 py-3">{d.no2?.toFixed(1) || '0.0'}</td>
                <td className="px-4 py-3">{d.temperature?.toFixed(1) || '0.0'}°C</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-6 transition-all duration-300">
        {/* Main Gauge area */}
        <AnimatedAQIGauge aqi={selectedData.predicted_aqi} category={selectedData.aqi_category} />

        {/* Pollutant Breakdown */}
        <PollutantCards data={selectedData} />

        {/* AI Insights */}
        <AIInsightsPanel data={selectedData} />
      </div>
    </GlassCard>
  );
};
