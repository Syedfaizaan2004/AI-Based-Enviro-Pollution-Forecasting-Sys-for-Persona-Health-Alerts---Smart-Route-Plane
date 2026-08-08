import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { PredictionResponse } from '../types/prediction';

export const AIInsightsPanel = ({ data }: { data: PredictionResponse }) => {
  
  // Generating smart text based on the backend data to act as AI Insights
  const getSummary = () => {
    if (data.predicted_aqi <= 50) return "The air quality is excellent. No precautions are necessary.";
    if (data.predicted_aqi <= 100) return "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.";
    if (data.predicted_aqi <= 150) return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
    return "Health alert: everyone may experience more serious health effects.";
  };

  const getMaskRecommendation = () => {
    if (data.predicted_aqi <= 50) return "Mask not required.";
    if (data.predicted_aqi <= 100) return "Optional, unless highly sensitive.";
    if (data.predicted_aqi <= 150) return "Recommended for sensitive groups.";
    return "N95 Mask strictly required outdoors.";
  };

  const getExerciseRecommendation = () => {
    if (data.predicted_aqi <= 50) return "Perfect conditions for outdoor workouts.";
    if (data.predicted_aqi <= 100) return "Good for most, but monitor if sensitive.";
    if (data.predicted_aqi <= 150) return "Reduce prolonged or heavy outdoor exertion.";
    return "Avoid all outdoor physical activities.";
  };

  const isGood = data.predicted_aqi <= 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mt-8 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background/40 to-background/10 backdrop-blur-md p-6"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="h-24 w-24 text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-1.5 bg-primary/20 rounded-md text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-lg">AI Health Insights</h3>
      </div>

      <div className="space-y-4 relative z-10">
        <p className="text-sm text-foreground/90 leading-relaxed font-medium">
          {getSummary()}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-start gap-3 bg-background/50 rounded-xl p-3 border border-border/40">
            {isGood ? <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Mask Guide</p>
              <p className="text-sm font-medium">{getMaskRecommendation()}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-background/50 rounded-xl p-3 border border-border/40">
            {isGood ? <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Exercise Guide</p>
              <p className="text-sm font-medium">{getExerciseRecommendation()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
