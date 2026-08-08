import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/glass-card';
import { useHistoryStore } from '../store/historyStore';
import { usePredictionsHistory } from '../hooks/useHistory';

export function AnalyticsCharts() {
  const { filters } = useHistoryStore();
  // Fetch up to 100 for charts if we want a good timeline
  const { data, isLoading } = usePredictionsHistory({ ...filters, size: 50 });

  if (isLoading || !data?.items?.length) return null;

  const chartData = [...data.items].reverse().map(item => ({
    time: format(new Date(item.prediction_timestamp), 'MMM d, HH:mm'),
    aqi: item.aqi_value,
    pm25: item.pm25
  }));

  return (
    <GlassCard className="p-6 mb-8">
      <h3 className="text-lg font-semibold mb-6">AQI & PM2.5 Trends</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="currentColor" 
              className="opacity-50 text-xs" 
              tick={{ fontSize: 12 }} 
              tickMargin={10} 
            />
            <YAxis 
              stroke="currentColor" 
              className="opacity-50 text-xs" 
              tick={{ fontSize: 12 }} 
              tickMargin={10} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              name="AQI Value"
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAqi)" 
            />
            <Area 
              type="monotone" 
              dataKey="pm25" 
              name="PM2.5 (µg/m³)"
              stroke="#ec4899" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPm25)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
