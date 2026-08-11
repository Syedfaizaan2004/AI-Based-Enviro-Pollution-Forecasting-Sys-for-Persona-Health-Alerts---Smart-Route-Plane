import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  LineChart, 
  Map as MapIcon, 
  HeartPulse, 
  History, 
  Bell, 
  Settings, 
  ShieldAlert,
  LogOut,
  MapPin,
  Menu,
  Leaf,
  MessageSquare
} from 'lucide-react';

import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { LANGUAGE_STORAGE_KEY, normalizeLanguageCode } from '@/constants/languages';
import { dashboardService } from '@/features/dashboard/services/dashboard';
import { authService } from '@/features/auth/services/auth';

import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { LiveAlertBanner } from '@/features/notifications/components/LiveAlertBanner';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { useNotificationsList, useNotificationPreferences } from '@/features/notifications/hooks/useNotifications';
import { ChatBot } from '@/features/chat/components/ChatBot';
import { FeedbackFormModal } from '@/features/feedback/components/FeedbackFormModal';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/prediction', label: 'Prediction', icon: LineChart },
  { path: '/routes', label: 'Smart Routes', icon: MapIcon },
  { path: '/health', label: 'Health', icon: HeartPulse },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '#feedback', label: 'Feedback', icon: MessageSquare },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('');
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  
  const { toggleDrawer } = useNotificationStore();
  const { data: notifications } = useNotificationsList(true);
  const { data: preferences } = useNotificationPreferences();
  
  const unreadCount = notifications?.length || 0;

  useEffect(() => {
    if (preferences?.preferred_language) {
      const preferredLanguage = normalizeLanguageCode(preferences.preferred_language);
      if (i18n.language !== preferredLanguage) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, preferredLanguage);
        i18n.changeLanguage(preferredLanguage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.preferred_language]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await dashboardService.reverseGeocode(
              position.coords.latitude, 
              position.coords.longitude
            );
            setCurrentCity(res.address.split(',')[0]);
          } catch {
            setCurrentCity(user?.city || 'Locating...');
          }
        },
        () => {
          setCurrentCity(user?.city || 'Locating...');
        }
      );
    } else {
      setCurrentCity(user?.city || '');
    }
  }, [user?.city]);

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with client-side logout even if API call fails
    } finally {
      queryClient.clear();
      clearSession();
      navigate('/login');
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full backdrop-blur-3xl border-r border-white/10 shadow-2xl transition-all duration-500" style={{background: 'linear-gradient(180deg, rgba(5,150,105,0.05) 0%, rgba(8,145,178,0.15) 100%), rgba(5,25,40,0.5)'}}>
      {/* Logo */}
      <Link to="/" className="h-16 flex items-center px-6 border-b border-white/5 font-bold text-lg tracking-tight gap-2.5 shrink-0 transition-colors" style={{color:'#34d399'}}>
        <Leaf className="h-5 w-5" />
        AirSense.AI
      </Link>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        <div className="text-xs font-semibold uppercase tracking-wider px-3 mb-3" style={{color:'rgba(255,255,255,0.7)'}}>
          {t('Overview')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <motion.div key={item.path} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <NavLink
                to={item.path === '#feedback' ? '#' : item.path}
                onClick={(e) => {
                  if (item.path === '#feedback') {
                    e.preventDefault();
                    setIsFeedbackModalOpen(true);
                  }
                  setSidebarOpen(false);
                }}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group shadow-sm hover:shadow-md"
                style={isActive
                  ? {background:'linear-gradient(135deg,#059669,#0891b2)', color:'#ffffff', boxShadow:'0 4px 12px rgba(5,150,105,0.3)', border:'1px solid rgba(255,255,255,0.1)'}
                  : {color:'#e2e8f0', border:'1px solid transparent'}
                }
              >
                <Icon className="h-4 w-4 mr-3 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={isActive ? {color:'#ffffff'} : {color:'#6ee7b7'}} />
                <span>{t(item.label)}</span>
              </NavLink>
            </motion.div>
          );
        })}

        {user?.role === 'admin' && (
          <div className="pt-6 mt-6 border-t border-white/5 space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider px-3 mb-3" style={{color:'rgba(255,255,255,0.7)'}}>
              {t('Administration')}
            </div>
            <NavLink
              to="/admin"
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group"
              style={({isActive}) => isActive
                ? {background:'rgba(239,68,68,0.15)', color:'#f87171'}
                : {color:'#e2e8f0'}
              }
            >
              <ShieldAlert className="h-4 w-4 mr-3 shrink-0" style={{color:'#f87171'}} />
              <span>{t('System Admin')}</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* User profile + sign out */}
      <div className="p-4 border-t border-white/5" style={{background:'rgba(0,0,0,0.2)'}}>
        <button
          onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
          className="w-full flex items-center text-left gap-3 mb-4 px-2 py-2 -mx-2 rounded-lg transition-colors cursor-pointer group"
          style={{background:'transparent'}}
          onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background='transparent')}
        >
          <div className="h-9 w-9 rounded-full p-[1px] shadow-sm" style={{background:'linear-gradient(135deg,#059669,#0891b2)'}}>
            <div className="h-full w-full rounded-full flex items-center justify-center" style={{background:'#0a1628'}}>
              <span className="text-xs font-bold" style={{color:'#34d399'}}>{user?.fullName?.charAt(0) || 'U'}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{color:'#f0f9ff'}}>{user?.fullName || 'User'}</p>
            <p className="text-xs truncate" style={{color:'#cbd5e1'}}>{user?.email || 'user@example.com'}</p>
          </div>
        </button>
        <button
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group"
          style={{color:'#cbd5e1'}}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#cbd5e1'; }}
        >
          <LogOut className="h-4 w-4" style={{color:'inherit'}} />
          {t('Sign out')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex relative selection:bg-emerald-500/20 selection:text-emerald-200">
      {/* 4-Color Animated Blobs — Layer on top of body gradient */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none z-0 opacity-15" style={{background:'radial-gradient(circle, rgba(5,150,105,0.45) 0%, transparent 65%)', filter:'blur(100px)', animation:'blob-drift 10s ease-in-out infinite alternate'}} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-15" style={{background:'radial-gradient(circle, rgba(8,145,178,0.40) 0%, transparent 65%)', filter:'blur(90px)', animation:'blob-drift 14s ease-in-out infinite alternate-reverse'}} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-10" style={{background:'radial-gradient(circle, rgba(13,148,136,0.35) 0%, transparent 65%)', filter:'blur(80px)', animation:'blob-drift 8s ease-in-out infinite alternate'}} />

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col relative z-20 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <LiveAlertBanner />

        {/* Top Navigation */}
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 relative z-[60] shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden hover:bg-muted/50" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm" style={{color:'#94b3cb', background:'rgba(255,255,255,0.05)'}}>
              <MapPin className="h-3.5 w-3.5 mr-1.5" style={{color:'#34d399'}} />
              {currentCity || 'Locating...'}
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageSelector className="max-w-[9.5rem] sm:max-w-none" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full hover:bg-muted/50"
              onClick={toggleDrawer}
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1.5 h-2.5 w-2.5 bg-destructive rounded-full flex items-center justify-center ring-2 ring-background animate-pulse"
                  />
                )}
              </AnimatePresence>
            </Button>
            
            <div className="rounded-full hover:bg-muted/50">
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-full"
          >
            <div className="min-h-full max-w-[1920px] mx-auto">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>
      
      <NotificationCenter />
      <ChatBot />
      <FeedbackFormModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
}
