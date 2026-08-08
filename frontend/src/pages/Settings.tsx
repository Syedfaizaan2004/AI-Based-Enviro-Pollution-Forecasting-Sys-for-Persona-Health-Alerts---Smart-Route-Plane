import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsLayout } from '@/features/settings/components/SettingsLayout';

export function Settings() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-12 relative z-0 overflow-x-hidden">
      
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <div className="px-4 md:px-6 lg:px-8 py-8 border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4 max-w-[1920px] mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Settings</h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Manage your preferences, devices, and data.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
        <SettingsLayout />
      </div>
    </div>
  );
}
