import { motion } from 'framer-motion';
import { Wind, Droplets, ThermometerSun } from 'lucide-react';
import type { PredictionResponse } from '../types/prediction';

export const PollutantCards = ({ data }: { data: PredictionResponse }) => {
  const cards = [
    { title: 'PM2.5', value: data.pm25, unit: 'µg/m³', icon: Wind, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { title: 'PM10', value: data.pm10, unit: 'µg/m³', icon: Wind, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'Temperature', value: data.temperature, unit: '°C', icon: ThermometerSun, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Humidity', value: data.humidity, unit: '%', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + (index * 0.1) }}
          className="bg-background/40 border border-border/50 rounded-2xl p-4 flex flex-col gap-3 hover:bg-background/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
            <div className={`p-1.5 rounded-md ${card.bg} ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{card.value.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-semibold">{card.unit}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
