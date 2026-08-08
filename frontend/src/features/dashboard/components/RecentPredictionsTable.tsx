import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import type { Prediction } from '../types/dashboard';
import { format } from 'date-fns';

export const RecentPredictionsTable = ({ predictions }: { predictions: Prediction[] }) => {
  return (
    <GlassCard className="p-6 border-border/50 overflow-hidden flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Predictions</h3>
          <p className="text-sm text-muted-foreground">Your history of AQI forecasts</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
            <tr>
              <th className="px-4 py-3 font-medium rounded-l-lg">City</th>
              <th className="px-4 py-3 font-medium">Predicted AQI</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Risk Level</th>
              <th className="px-4 py-3 font-medium rounded-r-lg text-right">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred) => (
              <tr key={pred.id} className="border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3.5 font-medium">{pred.city}</td>
                <td className="px-4 py-3.5">
                  <span className="font-semibold">{pred.predictedAqi}</span>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {format(new Date(pred.predictionTime), 'MMM dd, HH:mm')}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={pred.healthRisk === 'High' ? 'destructive' : pred.healthRisk === 'Moderate' ? 'secondary' : 'default'} className="font-medium">
                    {pred.healthRisk}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-right font-medium">
                  {pred.confidence}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
