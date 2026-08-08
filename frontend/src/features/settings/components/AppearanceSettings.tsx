import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Palette, Eye } from 'lucide-react';
import { useTheme } from '@/store/themeStore';

export function AppearanceSettings() {
  const { theme, setTheme, accent, setAccent, highContrast, setHighContrast } = useTheme();

  const accents: { id: 'emerald' | 'blue' | 'indigo' | 'rose', color: string }[] = [
    { id: 'emerald', color: 'bg-emerald-500' },
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'indigo', color: 'bg-indigo-500' },
    { id: 'rose', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Appearance & Accessibility</h2>
        <p className="text-muted-foreground mt-1">Customize how the dashboard looks and feels.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Theme Preference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'light' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-background/50 hover:bg-muted'
            }`}
          >
            <Sun className="h-6 w-6" />
            <span className="font-semibold text-sm">Light Mode</span>
          </button>
          
          <button 
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'dark' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-background/50 hover:bg-muted'
            }`}
          >
            <Moon className="h-6 w-6" />
            <span className="font-semibold text-sm">Dark Mode</span>
          </button>
          
          <button 
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'system' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-background/50 hover:bg-muted'
            }`}
          >
            <Monitor className="h-6 w-6" />
            <span className="font-semibold text-sm">System Default</span>
          </button>
        </div>
      </div>

      <GlassCard className="p-6 space-y-6">
        {/* Accent Color */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Accent Color</h3>
              <p className="text-sm text-muted-foreground">Choose your dashboard's primary brand color.</p>
            </div>
          </div>
          <div className="flex gap-3">
            {accents.map(acc => (
              <button
                key={acc.id}
                onClick={() => setAccent(acc.id)}
                className={`h-8 w-8 rounded-full ${acc.color} transition-transform ${
                  accent === acc.id ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110' : 'hover:scale-110 opacity-80'
                }`}
              />
            ))}
          </div>
        </div>

        <hr className="border-border/50" />

        {/* High Contrast */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">High Contrast Mode</h3>
              <p className="text-sm text-muted-foreground">Increase legibility on maps and charts for visual accessibility.</p>
            </div>
          </div>
          <Button 
            variant={highContrast ? "default" : "outline"}
            onClick={() => setHighContrast(!highContrast)}
            className={highContrast ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
          >
            {highContrast ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
