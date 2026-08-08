import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Calendar, Clock, Activity, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { predictionFormSchema, type PredictionFormValues } from '../validation/prediction';
import { CityAutocomplete } from './CityAutocomplete';
import { api } from '@/services/api';

interface PredictionFormProps {
  onSubmit: (data: PredictionFormValues) => void;
  isLoading: boolean;
  defaultCity?: string;
}

export const PredictionForm = ({ onSubmit, isLoading, defaultCity }: PredictionFormProps) => {
  const initialCity = defaultCity || "";

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      city: initialCity,
      latitude: 0, // Will be overridden on submit or by autocomplete
      longitude: 0,
      predictionDate: new Date().toLocaleDateString('en-CA'), // local YYYY-MM-DD
      predictionTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      healthCondition: "none",
    }
  });

  useEffect(() => {
    if (defaultCity) {
      setValue('city', defaultCity);
    }
  }, [defaultCity, setValue]);

  return (
    <GlassCard className="p-6 md:p-8 bg-background/60 backdrop-blur-xl border-border/50 h-full flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="mb-8 relative z-10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">New Prediction</h2>
        <p className="text-sm text-muted-foreground">
          Configure parameters to generate an AI-driven AQI forecast.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col relative z-10">
        
        {/* Location Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground/90">
            <MapPin className="h-4 w-4 text-primary" /> Location
          </label>
          <CityAutocomplete 
            value={watch('city')} // React hook form binds automatically below
            onChange={async (city) => {
              setValue('city', city, { shouldValidate: true });
              if (city) {
                try {
                  const { data } = await api.post('/maps/geocode', { address: city });
                  if (data && data.location) {
                    setValue('latitude', data.location.lat);
                    setValue('longitude', data.location.lng);
                  }
                } catch (err) {
                  console.error("Failed to geocode city", err);
                }
              }
            }}
            error={errors.city?.message}
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground/90">
              <Calendar className="h-4 w-4 text-secondary" /> Date
            </label>
            <Input 
              {...register('predictionDate')} 
              type="date" 
              className="h-12 bg-background/50 rounded-xl [color-scheme:dark]"
            />
            {errors.predictionDate && <p className="text-xs text-destructive mt-1">{errors.predictionDate.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-foreground/90">
              <Clock className="h-4 w-4 text-emerald-400" /> Time
            </label>
            <Input 
              {...register('predictionTime')} 
              type="time" 
              className="h-12 bg-background/50 rounded-xl [color-scheme:dark]"
            />
            {errors.predictionTime && <p className="text-xs text-destructive mt-1">{errors.predictionTime.message}</p>}
          </div>
        </div>

        {/* Health Profile */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-foreground/90">
            <Activity className="h-4 w-4 text-rose-400" /> Pre-existing Condition (Optional)
          </label>
          <select 
            {...register('healthCondition')}
            className="flex h-12 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm transition-all focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="none">None</option>
            <option value="asthma">Asthma</option>
            <option value="copd">COPD</option>
            <option value="heart_disease">Heart Disease</option>
          </select>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-4 pt-4 mt-8 border-t border-border/30">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => reset()}
            disabled={isLoading}
            className="h-12 px-6 rounded-xl border-border/50 hover:bg-muted/50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-[2px]"
          >
            {isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing AI Model...
              </motion.div>
            ) : (
              "Generate Prediction"
            )}
          </Button>
        </div>

      </form>
    </GlassCard>
  );
};
