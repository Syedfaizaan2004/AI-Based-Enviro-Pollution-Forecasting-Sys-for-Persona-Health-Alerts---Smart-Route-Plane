import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export const SymptomLogger = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (symptom: string) => {
    setSelected(symptom);
    // In a real app, this would dispatch to a backend API to save the daily log
  };

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-center bg-background/60 backdrop-blur-xl border-border/50 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div 
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full justify-between"
          >
            <h3 className="text-sm font-bold mb-4">How are you feeling today?</h3>
            <div className="flex justify-between items-center px-2">
              <button 
                onClick={() => handleSelect('great')}
                className="flex flex-col items-center gap-2 hover:scale-110 transition-transform focus:outline-none"
              >
                <span className="text-4xl drop-shadow-md">😊</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Great</span>
              </button>
              <button 
                onClick={() => handleSelect('okay')}
                className="flex flex-col items-center gap-2 hover:scale-110 transition-transform focus:outline-none"
              >
                <span className="text-4xl drop-shadow-md">😐</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Okay</span>
              </button>
              <button 
                onClick={() => handleSelect('bad')}
                className="flex flex-col items-center gap-2 hover:scale-110 transition-transform focus:outline-none"
              >
                <span className="text-4xl drop-shadow-md">😷</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Symptoms</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-3 text-center"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold">Log Saved</p>
              <p className="text-xs text-muted-foreground">Thanks for checking in today!</p>
            </div>
            <button 
              onClick={() => setSelected(null)}
              className="text-[10px] uppercase font-bold text-primary mt-2 hover:underline"
            >
              Change Log
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
