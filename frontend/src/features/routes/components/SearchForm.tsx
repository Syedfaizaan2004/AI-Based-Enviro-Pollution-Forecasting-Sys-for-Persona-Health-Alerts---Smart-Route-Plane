import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Activity, Loader2, Car, Bike, PersonStanding } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { AutocompleteInput } from './AutocompleteInput';
import { routeSearchSchema, type RouteSearchValues } from '../validation/route';
import { useRouteStore } from '../store/routeStore';

interface SearchFormProps {
  onSubmit: (data: RouteSearchValues) => void;
  onPreview?: (source: string, destination: string) => void;
  isLoading: boolean;
  isPreviewing?: boolean;
}

export const SearchForm = ({ onSubmit, onPreview, isLoading, isPreviewing }: SearchFormProps) => {
  const { 
    travelMode, setTravelMode, 
    priority, setPriority,
    avoidHighAQI, toggleAvoidHighAQI,
    avoidTraffic, toggleAvoidTraffic,
    avoidConstruction, toggleAvoidConstruction
  } = useRouteStore();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<RouteSearchValues>({
    resolver: zodResolver(routeSearchSchema),
    defaultValues: {
      source: '',
      destination: '',
      travelDate: new Date().toISOString().split('T')[0],
      travelTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      healthCondition: 'none',
    }
  });

  const sourceVal = watch('source');
  const destVal = watch('destination');

  const handlePreviewClick = () => {
    if (sourceVal && destVal && onPreview) {
      onPreview(sourceVal, destVal);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-6 bg-background/60 backdrop-blur-xl border-border/50 sticky top-4 overflow-y-auto max-h-[calc(100vh-2rem)] hide-scrollbar shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Plan Route</h2>
      </div>

      <motion.form 
        variants={container} 
        initial="hidden" 
        animate="show" 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-5"
      >
        {/* Locations */}
        <motion.div variants={item} className="space-y-3 relative">
          <div className="absolute left-[11px] top-[22px] bottom-[22px] w-0.5 bg-border/80 z-0 border-dashed border-l-2" />
          
          <div className="relative z-10 flex gap-3">
            <div className="mt-2.5 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <AutocompleteInput 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Current Location (e.g. Mumbai)" 
                    className="h-11 bg-background/80 shadow-sm border-border/50"
                    error={errors.source?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="relative z-10 flex gap-3">
            <div className="mt-2.5 h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
              <MapPin className="h-3 w-3 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <AutocompleteInput 
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Destination (e.g. Pune)" 
                    className="h-11 bg-background/80 shadow-sm border-border/50"
                    error={errors.destination?.message}
                  />
                )}
              />
            </div>
          </div>
        </motion.div>

        {/* Travel Mode (UI Only, per plan) */}
        <motion.div variants={item} className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Travel Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Driving', icon: Car },
              { id: 'Cycling', icon: Bike },
              { id: 'Walking', icon: PersonStanding }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTravelMode(mode.id as any)}
                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${
                  travelMode === mode.id 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                    : 'bg-background/50 border-border/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <mode.icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{mode.id}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Date & Time */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
            <Input 
              {...register('travelDate')} 
              type="date" 
              className="h-10 text-xs bg-background/80 shadow-sm [color-scheme:dark]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</label>
            <Input 
              {...register('travelTime')} 
              type="time" 
              className="h-10 text-xs bg-background/80 shadow-sm [color-scheme:dark]"
            />
          </div>
        </motion.div>

        {/* Health Profile */}
        <motion.div variants={item} className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Activity className="h-3 w-3" /> Sensitivity
          </label>
          <select 
            {...register('healthCondition')}
            className="flex h-10 w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="none">None / General</option>
            <option value="asthma">Asthma</option>
            <option value="copd">COPD</option>
            <option value="heart_disease">Heart Disease</option>
          </select>
        </motion.div>

        {/* Preferences / Priorities (UI Only) */}
        <motion.div variants={item} className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
          <div className="flex bg-muted/50 p-1 rounded-xl">
            {(['Fastest', 'Cleanest', 'Balanced'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  priority === p ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            {[
              { label: 'Avoid High AQI Zones', state: avoidHighAQI, toggle: toggleAvoidHighAQI, color: 'text-emerald-500' },
              { label: 'Avoid Traffic', state: avoidTraffic, toggle: toggleAvoidTraffic, color: 'text-amber-500' },
              { label: 'Avoid Construction', state: avoidConstruction, toggle: toggleAvoidConstruction, color: 'text-destructive' }
            ].map(pref => (
              <label key={pref.label} className="flex items-center justify-between group cursor-pointer">
                <span className={`text-sm ${pref.state ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {pref.label}
                </span>
                <div 
                  onClick={pref.toggle}
                  className={`w-8 h-4 rounded-full relative transition-colors ${pref.state ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${pref.state ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            type="button" 
            variant="secondary"
            disabled={isLoading || isPreviewing || !sourceVal || !destVal}
            onClick={handlePreviewClick}
            className="w-full h-11 rounded-xl font-semibold transition-all shadow-sm"
          >
            {isPreviewing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Wait...
              </span>
            ) : "Fast Preview"}
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading || isPreviewing}
            className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Routing...
              </span>
            ) : (
              "Smart Route"
            )}
          </Button>
        </motion.div>
      </motion.form>
    </GlassCard>
  );
};
