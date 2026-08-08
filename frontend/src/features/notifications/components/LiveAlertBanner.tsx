import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useCurrentAdvisory } from '../hooks/useNotifications';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function LiveAlertBanner() {
  const { data: advisory, isLoading } = useCurrentAdvisory();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !advisory || dismissed) {
    return null;
  }

  const isCritical = advisory.risk_level === 'High' || advisory.risk_level === 'Severe';

  const handleClick = () => {
    if (advisory.route_id) {
      navigate('/routes');
    } else if (advisory.prediction_id) {
      navigate('/prediction');
    } else {
      navigate('/health');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`relative z-40 px-4 py-3 sm:px-6 flex items-center justify-between gap-4 border-b shadow-md ${
          isCritical 
            ? 'bg-destructive text-destructive-foreground border-destructive-foreground/20' 
            : 'bg-orange-500 text-white border-orange-400/20'
        }`}
      >
        <div 
          className="flex-1 flex items-center gap-3 cursor-pointer group" 
          onClick={handleClick}
        >
          <div className="bg-white/20 p-1.5 rounded-full shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-xs bg-white/20 px-2 py-0.5 rounded-sm">
                {advisory.risk_level} Risk Alert
              </span>
            </div>
            <p className="text-sm font-medium mt-0.5 leading-snug line-clamp-1 sm:line-clamp-none opacity-90 group-hover:opacity-100 transition-opacity">
              {advisory.advisory_text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleClick}
            className="hidden sm:flex items-center text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-md"
          >
            Details <ChevronRight className="h-3 w-3 ml-1" />
          </button>
          <button 
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
            title="Dismiss"
          >
            <X className="h-5 w-5 opacity-80" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
