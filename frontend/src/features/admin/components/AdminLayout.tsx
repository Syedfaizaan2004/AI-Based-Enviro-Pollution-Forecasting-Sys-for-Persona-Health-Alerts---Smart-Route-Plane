import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, HardDrive, Terminal, Bell, FileText, User as UserIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { AdminOverview } from './AdminOverview';
import { UserManagementTable } from './UserManagementTable';
import { SystemManagement } from './SystemManagement';
import { ApiLogsTable } from './ApiLogsTable';
import { NotificationLogsTable } from './NotificationLogsTable';
import { HealthAdvisoryCms } from './HealthAdvisoryCms';
import { AdminProfile } from './AdminProfile';

type AdminTab = 'overview' | 'profile' | 'users' | 'system' | 'logs' | 'notifications' | 'cms';

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const navigate = useNavigate();
  const { clearSession } = useAuthStore();

  const tabs = [
    { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Admin Profile', icon: UserIcon },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'cms', label: 'Health Advisories', icon: FileText },
    { id: 'system', label: 'System & Cache', icon: HardDrive },
    { id: 'logs', label: 'System Logs', icon: Terminal },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'profile': return <AdminProfile />;
      case 'users': return <UserManagementTable />;
      case 'cms': return <HealthAdvisoryCms />;
      case 'system': return <SystemManagement />;
      case 'logs': return <ApiLogsTable />;
      case 'notifications': return <NotificationLogsTable />;
      default: return null;
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2 p-5 rounded-2xl border border-white/8 backdrop-blur-2xl shadow-xl relative overflow-y-auto md:sticky md:top-6 self-start h-fit max-h-[calc(100vh-4rem)]" style={{background:'rgba(5,15,45,0.80)'}}>
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{background:'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, transparent 60%, rgba(5,150,105,0.06) 100%)'}}></div>
        <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 px-3 relative z-10" style={{color:'rgba(148,179,203,0.65)'}}>Admin Menu</h2>
        <div className="flex flex-col gap-1 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm w-full text-left"
                style={isActive
                  ? {color:'#ffffff', fontWeight:600}
                  : {color:'#94b3cb'}
                }
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color='#e2f0ff'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color='#94b3cb'; e.currentTarget.style.background='transparent'; }}}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 rounded-xl"
                    style={{background:'linear-gradient(135deg, #6366f1, #059669)'}}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className="h-4 w-4 transition-transform duration-300" style={{color: isActive ? '#ffffff' : '#6ee7b7'}} />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm w-full text-left font-medium"
            style={{color:'#94b3cb'}}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.color='#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94b3cb'; }}
          >
            <LogOut className="h-4 w-4" style={{color:'inherit'}} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
