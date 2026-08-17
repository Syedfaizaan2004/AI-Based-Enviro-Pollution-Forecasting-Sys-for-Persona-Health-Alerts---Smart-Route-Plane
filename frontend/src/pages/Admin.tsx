import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, HardDrive, Terminal, Bell,
  FileText, User as UserIcon, LogOut, ShieldAlert, Menu,
  ChevronRight, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { AdminOverview } from '@/features/admin/components/AdminOverview';
import { UserManagementTable } from '@/features/admin/components/UserManagementTable';
import { SystemManagement } from '@/features/admin/components/SystemManagement';
import { ApiLogsTable } from '@/features/admin/components/ApiLogsTable';
import { NotificationLogsTable } from '@/features/admin/components/NotificationLogsTable';
import { HealthAdvisoryCms } from '@/features/admin/components/HealthAdvisoryCms';
import { AdminProfile } from '@/features/admin/components/AdminProfile';
import { FeedbackManagementTable } from '@/features/admin/components/FeedbackManagementTable';

type AdminTab = 'overview' | 'profile' | 'users' | 'system' | 'logs' | 'notifications' | 'cms' | 'feedback';

const tabs = [
  { id: 'overview',       label: 'Dashboard',         icon: LayoutDashboard, color: '#059669' }, /* Emerald */
  { id: 'profile',        label: 'Admin Profile',      icon: UserIcon,        color: '#0d9488' }, /* Teal */
  { id: 'users',          label: 'User Management',    icon: Users,           color: '#059669' }, /* Emerald */
  { id: 'cms',            label: 'Health Advisories',  icon: FileText,        color: '#84cc16' }, /* Leaf Green */
  { id: 'system',         label: 'System & Cache',     icon: HardDrive,       color: '#14b8a6' }, /* Light Teal */
  { id: 'logs',           label: 'System Logs',        icon: Terminal,        color: '#475569' }, /* Slate/Stone */
  { id: 'notifications',  label: 'Notifications',      icon: Bell,            color: '#f59e0b' }, /* Amber */
  { id: 'feedback',       label: 'User Feedback',      icon: MessageSquare,   color: '#8b5cf6' }, /* Violet */
] as const;

function renderContent(tab: AdminTab) {
  switch (tab) {
    case 'overview':      return <AdminOverview />;
    case 'profile':       return <AdminProfile />;
    case 'users':         return <UserManagementTable />;
    case 'cms':           return <HealthAdvisoryCms />;
    case 'system':        return <SystemManagement />;
    case 'logs':          return <ApiLogsTable />;
    case 'notifications': return <NotificationLogsTable />;
    case 'feedback':      return <FeedbackManagementTable />;
    default:              return null;
  }
}

export function Admin() {
  const { user, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const queryClient = useQueryClient();
  const handleLogout = () => { 
    queryClient.clear();
    clearSession(); 
    navigate('/login'); 
  };
  const activeTabInfo = tabs.find(t => t.id === activeTab)!;

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 bg-background/50 backdrop-blur-sm rounded-3xl">
        <div className="p-5 rounded-full bg-destructive/15">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground">Access Denied</h2>
        <p className="max-w-md text-foreground/90">
          You do not have the required administrative privileges to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">

      {/* ── Ambient blobs ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-40" style={{background:'radial-gradient(circle, rgba(13,148,136,0.55) 0%, transparent 70%)', filter:'blur(120px)', animation:'blob-drift 10s ease-in-out infinite alternate'}} />
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full opacity-30" style={{background:'radial-gradient(circle, rgba(5,150,105,0.55) 0%, transparent 70%)', filter:'blur(130px)', animation:'blob-drift 14s ease-in-out infinite alternate-reverse'}} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full opacity-20" style={{background:'radial-gradient(circle, rgba(8,145,178,0.50) 0%, transparent 70%)', filter:'blur(100px)', animation:'blob-drift 8s ease-in-out infinite alternate'}} />
      </div>

      {/* ── Mobile sidebar overlay ────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-40 lg:hidden"
              style={{background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)'}}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}}
              transition={{type:'spring', damping:25, stiffness:220}}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden"
            >
              <Sidebar
                activeTab={activeTab}
                onSelect={(tab) => { setActiveTab(tab); setMobileSidebarOpen(false); }}
                onLogout={handleLogout}
                user={user}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar (permanent) ───────────────── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-shrink-0 relative z-10">
        <Sidebar activeTab={activeTab} onSelect={setActiveTab} onLogout={handleLogout} user={user} />
      </aside>

      {/* ── Main content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg transition-colors bg-muted hover:bg-muted/80 text-foreground/90"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <span className="text-foreground/90">Admin</span>
              <ChevronRight className="h-3.5 w-3.5 text-foreground/70" />
              <span className="font-semibold text-foreground">{activeTabInfo.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="live-dot" />
              System Live
            </div>
            {/* User avatar */}
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero Banner */}
          <div className="relative overflow-hidden px-4 lg:px-8 pt-8 pb-6">
            <div className="absolute inset-0 pointer-events-none" style={{background:`linear-gradient(135deg, rgba(13,148,136,0.12) 0%, transparent 60%)`}} />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-3 rounded-2xl flex-shrink-0 bg-gradient-to-br from-teal-600 to-emerald-600 shadow-lg shadow-teal-600/30">
                  <activeTabInfo.icon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-extrabold truncate text-foreground">
                    {activeTabInfo.label}
                  </h1>
                  <p className="text-sm mt-0.5 text-foreground/90">
                    Enterprise Administration · AirSense.AI Platform
                  </p>
                </div>
              </div>

              {/* Quick stats strip */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {[
                  {label:'Users', color:'#10b981'},
                  {label:'Secure', color:'#0d9488'},
                  {label:'Online', color:'#06b6d4'},
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:`${s.color}18`, color:s.color, border:`1px solid ${s.color}30`}}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color}} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="px-4 lg:px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{opacity:0, y:12}}
                animate={{opacity:1, y:0}}
                exit={{opacity:0, y:-8}}
                transition={{duration:0.22, ease:'easeOut'}}
              >
                {renderContent(activeTab)}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  activeTab, onSelect, onLogout, user
}: {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  onLogout: () => void;
  user: { fullName?: string; email?: string } | null;
}) {
  return (
    <div
      className="flex flex-col w-full h-full border-r shadow-2xl transition-all duration-500"
      style={{
        background: 'linear-gradient(180deg, #03100a 0%, #051a0c 60%, #071e0d 100%)',
        borderColor: 'rgba(5,150,105,0.25)',
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center gap-3 px-6 flex-shrink-0"
        style={{borderBottom:'1px solid rgba(5,150,105,0.20)'}}
      >
        <div className="p-1.5 rounded-lg" style={{background:'rgba(5,150,105,0.20)'}}>
          <ShieldAlert className="h-5 w-5" style={{color:'#4ade80'}} />
        </div>
        <div>
          <div className="font-bold text-base leading-tight" style={{color:'#f0fdf4'}}>AirSense.AI</div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4ade80'}}>Admin Panel</div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div
          className="text-[10px] font-bold uppercase tracking-widest px-3 pb-3"
          style={{color:'#86efac'}} /* bright-green — always readable */
        >
          Navigation
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.div key={tab.id} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => onSelect(tab.id)}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 text-left group overflow-hidden"
                style={isActive
                  ? {
                      background: 'rgba(2,60,30,0.95)',           /* very dark green — strong contrast */
                      color: '#ffffff',
                      boxShadow: '0 0 0 1px rgba(5,150,105,0.50), 0 4px 14px rgba(5,150,105,0.25)',
                      border: '1px solid rgba(5,150,105,0.50)',
                    }
                  : {
                      color: '#d1fae5',                            /* bright mint — always visible */
                      border: '1px solid transparent',
                      background: 'transparent',
                    }
                }
              >
                {/* Active left-bar accent */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                    style={{background: tab.color}}
                  />
                )}

                <div
                  className="p-1.5 rounded-lg flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: isActive ? 'rgba(5,150,105,0.25)' : 'rgba(5,150,105,0.12)',
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{color: isActive ? tab.color : '#4ade80'}}
                  />
                </div>

                <span className="flex-1 truncate">{tab.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="adminActiveIndicator"
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{background: tab.color}}
                    transition={{type:'spring', stiffness:400, damping:30}}
                  />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer — user info + logout */}
      <div
        className="flex-shrink-0 p-3 space-y-1"
        style={{borderTop:'1px solid rgba(5,150,105,0.20)', background:'rgba(0,0,0,0.35)'}}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{background:'rgba(5,150,105,0.10)', border:'1px solid rgba(5,150,105,0.20)'}}
        >
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{background:'rgba(5,150,105,0.25)', color:'#4ade80'}}
          >
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{color:'#f0fdf4'}}>{user?.fullName || 'Admin'}</div>
            <div className="text-xs truncate" style={{color:'#86efac'}}>{user?.email || ''}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{color:'#fca5a5'}}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#fca5a5'; }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" style={{color:'inherit'}} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
