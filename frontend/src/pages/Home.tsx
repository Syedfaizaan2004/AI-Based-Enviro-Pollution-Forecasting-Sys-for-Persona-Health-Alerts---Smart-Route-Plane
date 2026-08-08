import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Leaf, Wind, Zap, Map as MapIcon, ArrowRight, HeartPulse, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* Ambient Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[120px] pointer-events-none z-0" />
      
      {/* Sticky Top Nav */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-primary">
          <Leaf className="h-6 w-6" />
          AirSense.AI
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Button asChild className="rounded-full px-6 font-bold shadow-lg shadow-primary/25">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-8 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-bold tracking-wide uppercase mb-4">
              <SparklesIcon className="h-4 w-4" /> Next-Gen Health Routing
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.1]">
              Breathe Easier. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Navigate Smarter.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium">
              The world's first AI-powered navigation system that calculates the cleanest, safest routes based on your personal respiratory health profile.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-base font-bold group shadow-xl shadow-primary/20">
                <Link to="/signup">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-bold bg-background/50 backdrop-blur-sm">
                <Link to="/login">Go to Dashboard</Link>
              </Button>
            </div>
          </motion.div>

          {/* Floating UI Mockups */}
          <div className="w-full max-w-5xl mx-auto mt-20 relative h-[400px] hidden md:block">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] z-20"
            >
              <GlassCard className="p-2 bg-card/80 backdrop-blur-2xl border-border/50 shadow-2xl overflow-hidden rounded-2xl ring-1 ring-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600" 
                  alt="Map Navigation" 
                  className="w-full h-[400px] object-cover rounded-xl opacity-80 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
              </GlassCard>
            </motion.div>
            
            {/* Floating Stat Card */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute left-4 top-20 z-30"
            >
              <GlassCard className="p-4 flex items-center gap-4 border-emerald-500/30 bg-background/90 shadow-xl">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Wind className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-muted-foreground uppercase">PM2.5 Avoided</p>
                  <p className="text-xl font-black text-foreground">42% Lower</p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Your Health</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine hyper-local weather forecasting with machine learning to protect you from invisible threats.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Feature 1 - Large */}
            <GlassCard className="md:col-span-2 p-8 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-foreground mb-2">Smart Route Planning</h3>
                <p className="text-muted-foreground">
                  Stop taking the fastest route. Start taking the safest. Our algorithm evaluates live PM2.5, Ozone, and NO2 levels to build paths that keep your lungs clear.
                </p>
              </div>
            </GlassCard>

            {/* Feature 2 - Small */}
            <GlassCard className="p-8 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-foreground mb-2">Live Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Instant push notifications when hazardous air approaches your location.
                </p>
              </div>
            </GlassCard>

            {/* Feature 3 - Small */}
            <GlassCard className="p-8 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-rose-500" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-foreground mb-2">Health Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  Custom thresholds for Asthma, COPD, or elderly sensitivities.
                </p>
              </div>
            </GlassCard>

            {/* Feature 4 - Large */}
            <GlassCard className="md:col-span-2 p-8 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-foreground mb-2">Predictive Modeling</h3>
                <p className="text-muted-foreground">
                  Plan your week with confidence. Our AI forecasts pollution spikes up to 7 days in advance, so you know exactly when to exercise outdoors.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-4 border-t border-border/20 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                How It Works
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-background border-2 border-border/50 flex items-center justify-center text-xl font-black text-primary shadow-lg">1</div>
                <h3 className="text-xl font-bold">Create Profile</h3>
                <p className="text-muted-foreground">Tell us about your respiratory health and sensitivities.</p>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center text-xl font-black text-primary shadow-lg shadow-primary/20">2</div>
                <h3 className="text-xl font-bold">Search Destination</h3>
                <p className="text-muted-foreground">Enter where you want to go. The AI calculates thousands of possible paths.</p>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-black text-primary-foreground shadow-lg shadow-primary/40">3</div>
                <h3 className="text-xl font-bold">Navigate Safely</h3>
                <p className="text-muted-foreground">Follow the clean route and avoid invisible hazardous pollutants.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8 p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm -z-10" />
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Ready to take control of what you breathe?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of others who are navigating the world safely with AirSense.AI.
            </p>
            <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-6 text-center text-muted-foreground bg-background z-10 relative">
        <div className="flex items-center justify-center gap-2 font-black text-lg text-foreground mb-4">
          <Leaf className="h-5 w-5 text-primary" />
          AirSense.AI
        </div>
        <p className="text-sm mb-6">© 2026 AirSense.AI. All rights reserved.</p>
        <div className="flex justify-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
