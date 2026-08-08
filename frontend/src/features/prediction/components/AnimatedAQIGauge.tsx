import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnimatedAQIGaugeProps {
  aqi: number;
  category: string;
}

export const AnimatedAQIGauge = ({ aqi, category }: AnimatedAQIGaugeProps) => {
  const maxAQI = 500;
  const normalizedAQI = Math.min(aqi, maxAQI);
  
  const getCategoryColor = (aqiValue: number) => {
    if (aqiValue <= 50) return '#10B981'; // Good (Emerald)
    if (aqiValue <= 100) return '#F59E0B'; // Moderate (Amber)
    if (aqiValue <= 150) return '#F97316'; // Unhealthy for sensitive (Orange)
    if (aqiValue <= 200) return '#EF4444'; // Unhealthy (Red)
    if (aqiValue <= 300) return '#8B5CF6'; // Very Unhealthy (Purple)
    return '#881337'; // Hazardous (Maroon)
  };

  const data = [
    { name: 'AQI', value: normalizedAQI, color: getCategoryColor(aqi) },
    { name: 'Remaining', value: maxAQI - normalizedAQI, color: 'rgba(255,255,255,0.05)' },
  ];

  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-end overflow-hidden pt-4">
      <div className="absolute inset-0 w-full h-[200%] top-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="75%"
              outerRadius="100%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 flex flex-col items-center pb-4"
      >
        <span className="text-5xl font-black tracking-tighter" style={{ color: getCategoryColor(aqi) }}>
          {aqi}
        </span>
        <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mt-1">
          {category}
        </span>
      </motion.div>
    </div>
  );
};
