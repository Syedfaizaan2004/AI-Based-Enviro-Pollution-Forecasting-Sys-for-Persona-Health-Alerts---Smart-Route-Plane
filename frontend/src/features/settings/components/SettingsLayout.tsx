import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, HeartPulse, BellRing, SlidersHorizontal } from 'lucide-react';
import { AccountSettings } from './AccountSettings';
import { SecuritySettings } from './SecuritySettings';
import { HealthSettings } from './HealthSettings';
import { NotificationPreferences } from './NotificationPreferences';
import { ConnectedAppsSettings } from './ConnectedAppsSettings';
import { EmergencySettings } from './EmergencySettings';
import { AppearanceSettings } from './AppearanceSettings';
import { PrivacySettings } from './PrivacySettings';

type SettingsTab = 'account' | 'security' | 'health' | 'notifications' | 'connected' | 'emergency' | 'appearance' | 'privacy';

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'health', label: 'Health Profile', icon: HeartPulse },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'connected', label: 'Connected Apps', icon: SlidersHorizontal },
    { id: 'emergency', label: 'Emergency & Family', icon: User },
    { id: 'appearance', label: 'Appearance', icon: SlidersHorizontal },
    { id: 'privacy', label: 'Data & Privacy', icon: ShieldCheck },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'account': return <AccountSettings />;
      case 'security': return <SecuritySettings />;
      case 'health': return <HealthSettings />;
      case 'notifications': return <NotificationPreferences />;
      case 'connected': return <ConnectedAppsSettings />;
      case 'emergency': return <EmergencySettings />;
      case 'appearance': return <AppearanceSettings />;
      case 'privacy': return <PrivacySettings />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-left ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
