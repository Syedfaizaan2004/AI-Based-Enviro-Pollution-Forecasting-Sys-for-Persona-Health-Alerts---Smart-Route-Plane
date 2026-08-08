import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart3, LineChart } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useExposureCharts } from '../hooks/useHealth';

export const ExposureAnalyticsChart = () => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const { data: chartData, isLoading } = useExposureCharts(chartType);

  // Transform backend chartData to Recharts format
  // backend: { labels: ['Mon','Tue'...], datasets: [{label: 'Exposure', data: [10, 20...]}] }
  const transformedData = chartData?.labels.map((label, index) => {
    const dataPoint: any = { name: label };
    chartData.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  }) || [];

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold tracking-tight">Exposure Trends</h2>
            <p className="text-xs text-muted-foreground">30-Day Historical Data</p>
          </div>
        </div>
        
        {/* Toggle between Line and Area (API supports both, but Area looks better usually) */}
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button 
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-md transition-colors ${chartType === 'area' ? 'bg-background shadow text-primary' : 'text-muted-foreground'}`}
          >
            <LineChart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-16 bg-muted rounded-full"></div>
              <div className="w-2 h-24 bg-muted rounded-full"></div>
              <div className="w-2 h-10 bg-muted rounded-full"></div>
              <div className="w-2 h-20 bg-muted rounded-full"></div>
              <div className="w-2 h-12 bg-muted rounded-full"></div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transformedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: '12px' }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px' }}
              />
              {chartData?.datasets.map((dataset, idx) => (
                <Area 
                  key={dataset.label}
                  type="monotone" 
                  dataKey={dataset.label} 
                  stroke={idx === 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                  fillOpacity={1} 
                  fill={idx === 0 ? "url(#colorExposure)" : "transparent"} 
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
};
