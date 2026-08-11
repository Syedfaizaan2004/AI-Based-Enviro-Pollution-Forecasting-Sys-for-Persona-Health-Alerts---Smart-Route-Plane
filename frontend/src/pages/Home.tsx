import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { Link } from 'react-router';
import {
  ArrowRight,
  MapPin,
  Zap,
  HeartPulse,
  BrainCircuit,
  CheckCircle2,
  Wind,
  BarChart3,
  Globe2,
  ChevronRight,
  Activity,
  Leaf,
} from 'lucide-react';
import { useRef } from 'react';

/* ─── tiny helpers ─────────────────────────────────────────── */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
      {children}
    </span>
  );
}

function GlowDot({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_2px_rgba(16,185,129,0.7)] ${className ?? ''}`}
    />
  );
}

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── main component ───────────────────────────────────────── */
export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* ── ambient orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] top-[-10%] h-[70vw] w-[70vw] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute -right-[15%] top-[30%] h-[55vw] w-[55vw] rounded-full bg-secondary/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[60vw] w-[60vw] rounded-full bg-primary/5 blur-[180px]" />
      </div>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-background/70 px-6 backdrop-blur-xl lg:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-gradient text-lg font-['Geist']">
            AirSense.AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {['Features', 'How It Works', 'Technology'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, '-')}`}
              className="transition-colors duration-200 hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] bg-gradient-to-r from-primary to-secondary"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative flex min-h-[85vh] items-center overflow-hidden px-4 py-16 md:px-12"
        >
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* left copy */}
            <motion.div initial="hidden" animate="show" className="flex flex-col gap-6">
              <motion.div variants={FADE_UP} custom={0}>
                <Badge>
                  <GlowDot />
                  AI-Powered Environmental Intelligence
                </Badge>
              </motion.div>

              <motion.h1
                variants={FADE_UP}
                custom={1}
                className="font-black leading-[1.1] tracking-tight text-foreground text-5xl md:text-6xl lg:text-7xl font-['Geist']"
              >
                Breathe Easier.{' '}
                <span className="text-gradient">Navigate Smarter.</span>
              </motion.h1>

              <motion.p
                variants={FADE_UP}
                custom={2}
                className="max-w-lg text-base leading-relaxed md:text-lg text-muted-foreground font-medium"
              >
                AI-powered route planning designed to help you avoid dangerous pollution hotspots — PM2.5, NO₂, and Ozone. Arrive safely and breathe clean, every single day.
              </motion.p>

              {/* cta buttons */}
              <motion.div variants={FADE_UP} custom={3} className="flex flex-wrap items-center gap-4">
                <Link
                  to="/signup"
                  className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(16,185,129,0.55)] bg-gradient-to-r from-primary to-secondary"
                >
                  Start Your Journey
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-7 py-3.5 text-sm font-bold text-primary transition-all duration-300 hover:border-primary/70 hover:bg-primary/10"
                >
                  View Dashboard <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

              {/* trust badges */}
              <motion.div variants={FADE_UP} custom={4} className="mt-2 flex flex-wrap items-center gap-5">
                {[{ label: 'No credit card required' }, { label: 'Free forever plan' }, { label: '50+ cities' }].map(
                  ({ label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {label}
                    </div>
                  )
                )}
              </motion.div>
            </motion.div>

            {/* right: hero image */}
            <motion.div
              initial={{ opacity: 0, x: 48, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: heroY, opacity: heroOpacity }}
              className="relative"
            >
              {/* main image card */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl">
                <img
                  src="/hero-map.jpg"
                  alt="AI pollution heatmap over a city at dusk showing safe zones and pollution zones"
                  className="w-full object-cover h-[400px] opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
              </div>

              {/* floating badges */}
              <motion.div
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
                className="absolute -left-4 top-6"
              >
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                    <Wind className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AQI Status</p>
                    <p className="text-sm font-bold text-primary">Good — 42</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
                className="absolute -right-4 bottom-16"
              >
                <div className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20">
                    <Activity className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PM2.5 Avoided</p>
                    <p className="text-sm font-bold text-secondary">42% Lower</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
                className="absolute -bottom-5 left-8"
              >
                <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-xl">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Routes Analyzed</p>
                    <p className="text-sm font-bold text-foreground">1.2M Today</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FEATURES — BENTO GRID
        ══════════════════════════════════════════════ */}
        <section id="features" className="px-4 py-16 md:px-12 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mb-8 text-center">
              <motion.div variants={FADE_UP} custom={0} className="mb-4 flex justify-center">
                <Badge>Platform Features</Badge>
              </motion.div>
              <motion.h2
                variants={FADE_UP}
                custom={1}
                className="font-black text-foreground text-3xl md:text-5xl font-['Geist'] tracking-tight"
              >
                Built for <span className="text-gradient">Your Health</span>
              </motion.h2>
              <motion.p variants={FADE_UP} custom={2} className="mx-auto mt-4 max-w-xl text-base text-muted-foreground font-medium">
                Our platform integrates real-time environmental data with predictive AI to keep you safe from invisible threats.
              </motion.p>
            </motion.div>

            {/* bento grid - adjusted sizing for consistency */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              {/* Feature 1 */}
              <motion.div
                variants={FADE_UP}
                custom={0}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-64 rounded-tl-[40px] opacity-[0.03] transition-opacity duration-500 group-hover:opacity-10 dark:opacity-10 dark:group-hover:opacity-20 bg-[url('/hero-map.jpg')] bg-cover bg-center [mask-image:linear-gradient(to_top_left,black,transparent)]" />
                
                <div className="relative flex h-full flex-col justify-end min-h-[200px]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Navigation AI</p>
                  <h3 className="mb-3 text-2xl font-bold text-foreground font-['Geist']">Smart Route Planning</h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-medium">
                    Stop taking the fastest route. Start taking the safest. Our algorithm evaluates live PM2.5, Ozone, and NO₂ levels to build paths that keep your lungs clear.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary">
                    <GlowDot /> Real-time recalculation as conditions change
                  </div>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                variants={FADE_UP}
                custom={1}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                  <Zap className="h-7 w-7 text-amber-500" />
                </div>
                
                <div className="relative flex h-full flex-col justify-end min-h-[200px]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">Instant Alerts</p>
                  <h3 className="mb-3 text-2xl font-bold text-foreground font-['Geist']">Live Air Quality Alerts</h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-medium">
                    Push notifications when hazardous air approaches your location or planned route. Stay informed instantly.
                  </p>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                variants={FADE_UP}
                custom={2}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
                  <HeartPulse className="h-7 w-7 text-rose-500" />
                </div>
                
                <div className="relative flex h-full flex-col justify-end min-h-[200px]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-rose-500">Personalized</p>
                  <h3 className="mb-3 text-2xl font-bold text-foreground font-['Geist']">Personal Health Profiles</h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-medium">
                    Custom thresholds for Asthma, COPD, elderly sensitivities, or cardiovascular conditions. Your health, your rules.
                  </p>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                variants={FADE_UP}
                custom={3}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10">
                  <BrainCircuit className="h-7 w-7 text-secondary" />
                </div>
                {/* mini bar chart decoration */}
                <div className="absolute bottom-8 right-8 flex items-end gap-1.5 opacity-20 transition-opacity duration-500 group-hover:opacity-40">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div
                      key={i}
                      className="w-3 rounded-sm bg-gradient-to-t from-secondary to-primary"
                      style={{ height: `${h * 0.5}px`, opacity: 0.6 + i * 0.05 }}
                    />
                  ))}
                </div>
                
                <div className="relative flex h-full flex-col justify-end min-h-[200px]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-secondary">Predictive AI</p>
                  <h3 className="mb-3 text-2xl font-bold text-foreground font-['Geist']">AI Pollution Forecasting</h3>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground font-medium">
                    Plan your week with confidence. Our ML models forecast pollution spikes up to 7 days in advance.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-secondary">
                    <GlowDot className="bg-secondary shadow-[0_0_8px_2px_rgba(8,145,178,0.7)]" />
                    94% forecast accuracy
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section id="how-it-works" className="relative px-4 py-16 md:px-12 border-t border-border/30">
          <div className="relative mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mb-8 text-center">
              <motion.div variants={FADE_UP} custom={0} className="mb-4 flex justify-center">
                <Badge>Simple Process</Badge>
              </motion.div>
              <motion.h2
                variants={FADE_UP}
                custom={1}
                className="font-black text-foreground text-3xl md:text-5xl font-['Geist'] tracking-tight"
              >
                Up and running in <span className="text-gradient">3 steps</span>
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="relative grid grid-cols-1 gap-5 md:grid-cols-3"
            >
              {/* connector line */}
              <div className="absolute left-1/2 top-10 hidden h-px w-2/3 -translate-x-1/2 md:block bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              {[
                {
                  step: '01',
                  title: 'Create Health Profile',
                  desc: 'Tell us about your respiratory health, sensitivities, and conditions so we can calibrate thresholds that matter to you.',
                  icon: HeartPulse,
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                  border: 'border-primary/30',
                },
                {
                  step: '02',
                  title: 'Search Destination',
                  desc: 'Enter where you want to go. Our AI calculates thousands of possible paths, weighing distance against real-time pollution exposure.',
                  icon: MapPin,
                  color: 'text-secondary',
                  bg: 'bg-secondary/10',
                  border: 'border-secondary/30',
                },
                {
                  step: '03',
                  title: 'Navigate Safely',
                  desc: 'Follow the cleanest route and receive live alerts if conditions change. Breathe easier knowing you\'re protected by AI.',
                  icon: Globe2,
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                  border: 'border-primary/30',
                },
              ].map(({ step, title, desc, icon: Icon, color, bg, border }, i) => (
                <motion.div key={step} variants={FADE_UP} custom={i} className="relative flex flex-col items-center text-center">
                  {/* step number circle */}
                  <div className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 ${border} bg-background shadow-sm`}>
                    <Icon className={`h-8 w-8 ${color}`} />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-black text-white shadow-md">
                      {i + 1}
                    </span>
                  </div>

                  {/* card */}
                  <div className="w-full rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-6 shadow-sm">
                    <h3 className="mb-3 text-lg font-bold text-foreground font-['Geist']">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground font-medium">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            STATS SECTION
        ══════════════════════════════════════════════ */}
        <section className="px-4 py-16 md:px-12 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                { value: '2M+', label: 'Routes Analyzed', sub: 'Every single day across 50+ cities', icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
                { value: '94%', label: 'Forecast Accuracy', sub: 'Validated against EPA ground sensors', icon: BrainCircuit, color: 'text-secondary', bg: 'bg-secondary/10' },
                { value: '50+', label: 'Cities Covered', sub: 'And expanding globally every month', icon: Globe2, color: 'text-primary', bg: 'bg-primary/10' },
              ].map(({ value, label, sub, icon: Icon, color, bg }, i) => (
                <motion.div
                  key={label}
                  variants={FADE_UP}
                  custom={i}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 text-center transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
                >
                  <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <p className={`text-5xl font-black ${color} font-['Geist'] tracking-tight`}>{value}</p>
                  <p className="mt-2 text-base font-bold text-foreground">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground font-medium">{sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TECHNOLOGY
        ══════════════════════════════════════════════ */}
        <section id="technology" className="px-4 py-16 md:px-12 border-t border-border/30">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div variants={FADE_UP} custom={0} className="relative order-2 lg:order-1">
                <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl">
                  <img src="/hero-map.jpg" alt="Real-time pollution heatmap" className="w-full object-cover h-[340px]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-background/30 to-transparent" />
                </div>
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-primary/30 bg-background/90 backdrop-blur-md px-3 py-1.5 shadow-md">
                  <GlowDot />
                  <span className="text-xs font-bold text-primary">LIVE DATA</span>
                </div>
              </motion.div>

              <motion.div variants={FADE_UP} custom={1} className="order-1 space-y-6 lg:order-2">
                <Badge>How Our AI Works</Badge>
                <h2 className="font-black text-foreground text-3xl md:text-4xl font-['Geist'] tracking-tight">
                  Real-time heatmaps, powered by satellite & sensor data
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground font-medium">
                  AirSense.AI fuses data from government air quality sensors, satellite imagery, IoT devices, and traffic APIs into a unified environmental model updated every 15 minutes.
                </p>
                <div className="space-y-4">
                  {[
                    { title: 'Multi-source data fusion', desc: 'Government sensors, satellites, weather stations, and traffic data in one model.' },
                    { title: '7-day pollution forecasting', desc: 'ML models trained on 5+ years of historical data predict spikes before they happen.' },
                    { title: 'Personalized health scoring', desc: 'Each route is scored against your individual health profile, not a generic average.' },
                  ].map(({ title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{title}</p>
                        <p className="text-sm text-muted-foreground font-medium mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════════ */}
        <section className="px-4 py-16 md:px-12 bg-muted/30">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl p-12 text-center border border-primary/20 bg-card shadow-2xl"
            >
              <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
              
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <Badge><GlowDot /> Start for free</Badge>
                </div>
                <h2 className="mb-4 font-black text-foreground text-3xl md:text-5xl font-['Geist'] tracking-tight">
                  Ready to breathe cleaner air?
                </h2>
                <p className="mx-auto mb-10 max-w-xl text-base text-muted-foreground font-medium">
                  Join thousands of users who navigate the world safely with AirSense.AI. Free to get started — no credit card required.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    to="/signup"
                    className="group flex items-center gap-2 rounded-full px-9 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] bg-gradient-to-r from-primary to-secondary"
                  >
                    Create Free Account
                    <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full border border-border px-9 py-4 text-base font-semibold text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:text-foreground bg-background"
                  >
                    Sign In Instead
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="relative px-6 py-14 border-t border-border/40 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="font-bold text-gradient font-['Geist']">AirSense.AI</span>
              </div>
              <p className="max-w-xs text-xs text-muted-foreground font-medium">
                Precision environmental monitoring for a sustainable future.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm md:justify-end">
              {['Privacy Policy', 'Terms of Service', 'API Docs', 'Contact Support'].map((label) => (
                <a key={label} href="#" className="font-medium text-muted-foreground transition-colors hover:text-primary">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground md:flex-row font-medium">
            <p>© 2026 AirSense.AI. All rights reserved.</p>
            <p>Built with ❤️ for cleaner air and healthier communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
