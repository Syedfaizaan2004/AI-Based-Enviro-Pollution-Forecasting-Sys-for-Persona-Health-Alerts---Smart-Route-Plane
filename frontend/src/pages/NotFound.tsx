import { Link } from 'react-router';
import { Leaf } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <GlassCard className="max-w-md w-full p-8 text-center relative z-10 border-white/10 bg-black/40">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/25">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/dashboard" 
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/" 
            className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground font-semibold border border-white/10 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
