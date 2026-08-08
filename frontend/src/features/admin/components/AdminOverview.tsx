import { motion } from 'framer-motion';
import { Users, Activity, Bell, Map, Database, Server, BrainCircuit, TrendingUp, MapPin } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useSystemStatus, useAdminAnalytics } from '../hooks/useAdmin';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function AdminOverview() {
  const { data: status, isLoading: statusLoading } = useSystemStatus();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();

  if (statusLoading || analyticsLoading || !status) {
    return <div className="animate-pulse h-[800px] w-full bg-muted/20 rounded-xl" />;
  }

  const metrics = [
    {
      title: 'Total Users',
      value: status.total_users,
      icon: Users,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Active Users',
      value: status.active_users,
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Total Predictions',
      value: status.total_predictions,
      icon: BrainCircuit,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'Routes Generated',
      value: status.total_routes,
      icon: Map,
      color: 'text-lime-500',
      bg: 'bg-lime-500/10'
    },
    {
      title: 'Notifications Sent',
      value: status.total_notifications,
      icon: Bell,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="h-full"
            >
              <GlassCard className="p-6 flex flex-col items-center text-center h-full group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-background via-background to-${metric.color.split('-')[1]}-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative z-10 p-3.5 rounded-2xl ${metric.bg} border border-${metric.color.split('-')[1]}-500/20 mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <h3 className="relative z-10 text-3xl font-extrabold tracking-tight text-foreground mb-1">
                  {metric.value.toLocaleString()}
                </h3>
                <p className="relative z-10 text-xs font-bold text-foreground/90 uppercase tracking-widest mt-auto">
                  {metric.title}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Database Health</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <div>
              <p className="text-sm font-medium">PostgreSQL Cluster</p>
              <p className="text-xs text-foreground/90">Primary Database</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status.database_status === 'ok' ? 'bg-emerald-500' : 'bg-destructive'}`} />
              <span className="text-sm font-medium capitalize">{status.database_status}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Cache & Brokers</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <div>
              <p className="text-sm font-medium">Redis Cluster</p>
              <p className="text-xs text-foreground/90">Cache & Session Store</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status.redis_status === 'ok' ? 'bg-emerald-500' : 'bg-destructive'}`} />
              <span className="text-sm font-medium capitalize">{status.redis_status}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Global Usage (Last 7 Days)</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.daily_usage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRoute" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="predictions" name="Predictions" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPred)" />
                  <Area type="monotone" dataKey="routes" name="Routes" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRoute)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Top Searched Cities</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_cities} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="city_name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" name="Searches" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
