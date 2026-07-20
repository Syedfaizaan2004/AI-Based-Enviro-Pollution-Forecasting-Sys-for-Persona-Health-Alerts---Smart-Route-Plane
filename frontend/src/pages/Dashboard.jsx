/**
 * Dashboard - authenticated environmental health overview.
 *
 * Keeps Week 1 data as placeholders while presenting a complete product shell:
 * local air readiness, health profile context, route planning, and upcoming
 * environmental monitoring features.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TbLeaf, TbLogout, TbActivity, TbWind,
  TbDroplet, TbTemperature, TbMapPin,
  TbShieldCheck, TbCalendar, TbUser,
} from 'react-icons/tb';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function initialsFor(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StatCard({ icon: Icon, label, value, unit, tone, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(145deg, rgba(7,31,22,0.86), rgba(6,24,31,0.72))',
        border: `1px solid ${tone}26`,
        borderRadius: 8,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 176,
        boxShadow: '0 18px 46px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: `${tone}14`,
          border: `1px solid ${tone}2c`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} color={tone} />
        </div>
        <span style={{
          borderRadius: 8,
          border: `1px solid ${tone}26`,
          color: tone,
          background: `${tone}0f`,
          padding: '5px 8px',
          fontSize: 11,
          fontWeight: 700,
        }}>
          Soon
        </span>
      </div>

      <div>
        <div style={{
          fontSize: 12,
          color: '#9bb8aa',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0,
          marginBottom: 8,
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: '#f0fdf4', lineHeight: 1 }}>
            {value}
          </span>
          {unit && <span style={{ fontSize: 12, color: '#83a694', fontWeight: 600 }}>{unit}</span>}
        </div>
        <p style={{ margin: '10px 0 0', color: '#83a694', fontSize: 12, lineHeight: 1.55 }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function InsightCard({ icon: Icon, title, text, tone, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      style={{
        background: 'rgba(242,252,244,0.055)',
        border: '1px solid rgba(187,247,208,0.12)',
        borderRadius: 8,
        padding: '18px',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}
    >
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        background: `${tone}14`,
        border: `1px solid ${tone}28`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={19} color={tone} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 6px', color: '#f0fdf4', fontSize: 15, fontWeight: 800 }}>
          {title}
        </h3>
        <p style={{ margin: 0, color: '#83a694', fontSize: 12, lineHeight: 1.6 }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

const STATS = [
  {
    icon: TbActivity,
    label: 'AQI Index',
    value: '--',
    unit: null,
    tone: '#86efac',
    description: 'Forecast feed will show neighbourhood air quality bands.',
    delay: 0.24,
  },
  {
    icon: TbWind,
    label: 'PM2.5',
    value: '--',
    unit: 'ug/m3',
    tone: '#22d3ee',
    description: 'Fine particle readings will power exposure-aware alerts.',
    delay: 0.31,
  },
  {
    icon: TbTemperature,
    label: 'Temperature',
    value: '--',
    unit: 'C',
    tone: '#fbbf24',
    description: 'Weather context will improve route and health guidance.',
    delay: 0.38,
  },
  {
    icon: TbDroplet,
    label: 'Humidity',
    value: '--',
    unit: '%',
    tone: '#a78bfa',
    description: 'Humidity trends will help interpret pollution sensitivity.',
    delay: 0.45,
  },
];

const INSIGHTS = [
  {
    icon: TbMapPin,
    title: 'Green Route Planner',
    text: 'Plan lower-exposure paths using live pollution layers once maps are connected.',
    tone: '#22d3ee',
    delay: 0.58,
  },
  {
    icon: TbShieldCheck,
    title: 'Health-Aware Alerts',
    text: 'Your profile will tune alerts for sensitive conditions and daily travel needs.',
    tone: '#86efac',
    delay: 0.65,
  },
  {
    icon: TbLeaf,
    title: 'Eco Habit Signals',
    text: 'Track cleaner commute choices and simple actions that reduce exposure.',
    tone: '#bef264',
    delay: 0.72,
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const today = new Date();

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User';
  const firstName = user?.first_name || 'User';
  const initials = initialsFor(fullName || firstName);

  const profileItems = [
    { icon: TbUser, text: `@${user?.username || 'user'}` },
    { icon: TbCalendar, text: formatDate(today) },
    ...(user?.health_issue ? [{ icon: TbShieldCheck, text: user.health_issue }] : []),
    ...(user?.place_to_visit ? [{ icon: TbMapPin, text: user.place_to_visit }] : []),
  ];

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out. See you again!');
    navigate('/login', { replace: true });
  };

  return (
    <div className="eco-page-shell">
      <AnimatedBackground />

      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(3, 16, 11, 0.82)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(187,247,208,0.12)',
          padding: '10px 24px',
          minHeight: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div className="eco-brand-mark">
            <TbLeaf size={21} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#f0fdf4', lineHeight: 1 }}>
              AirSense<span style={{ color: '#bef264' }}>.AI</span>
            </div>
            <div style={{ fontSize: 10, color: '#83a694', textTransform: 'uppercase', fontWeight: 700 }}>
              Environmental Dashboard
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '7px 10px',
            background: 'rgba(134,239,172,0.075)',
            border: '1px solid rgba(134,239,172,0.16)',
            borderRadius: 8,
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #16a34a, #0891b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: '#fff',
            }}>
              {initials}
            </div>
            <span style={{
              fontSize: 13,
              color: '#bbf7d0',
              fontWeight: 700,
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {fullName}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            aria-label="Logout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              minHeight: 42,
              padding: '8px 12px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#fca5a5',
              fontSize: 13,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
            }}
          >
            <TbLogout size={17} />
            Logout
          </motion.button>
        </div>
      </motion.nav>

      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1160,
        margin: '0 auto',
        padding: '42px 24px 84px',
      }}>
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
            alignItems: 'stretch',
            marginBottom: 22,
          }}
        >
          <div className="eco-panel" style={{ padding: '32px', minHeight: 250 }}>
            <div className="eco-chip" style={{ marginBottom: 18 }}>
              <TbActivity size={14} />
              Clean air readiness
            </div>
            <h1 style={{
              margin: 0,
              color: '#f0fdf4',
              fontSize: 'clamp(30px, 5vw, 52px)',
              lineHeight: 1.05,
              fontWeight: 900,
              maxWidth: 680,
            }}>
              Breathe better, <span className="gradient-text">{firstName}</span>
            </h1>
            <p style={{
              margin: '16px 0 0',
              color: '#b7d8c4',
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 620,
            }}>
              Your dashboard is ready for pollution forecasts, health alerts, and greener route planning.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              {profileItems.map(({ icon: Icon, text }) => (
                <span className="eco-chip" key={text}>
                  <Icon size={14} />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="eco-panel" style={{
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 20,
          }}>
            <div>
              <div style={{ color: '#83a694', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                Today
              </div>
              <div style={{ color: '#f0fdf4', fontSize: 44, lineHeight: 1, fontWeight: 900, marginTop: 8 }}>
                {String(today.getDate()).padStart(2, '0')}
              </div>
              <div style={{ color: '#bbf7d0', fontSize: 15, fontWeight: 800, marginTop: 8 }}>
                {today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div style={{
              paddingTop: 18,
              borderTop: '1px solid rgba(187,247,208,0.12)',
              color: '#83a694',
              fontSize: 13,
              lineHeight: 1.65,
            }}>
              Profile connected. Environmental sensors and forecast APIs can now feed this workspace.
            </div>
          </div>
        </motion.section>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {STATS.map(stat => <StatCard key={stat.label} {...stat} />)}
        </section>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {INSIGHTS.map(insight => <InsightCard key={insight.title} {...insight} />)}
        </section>
      </main>
    </div>
  );
}
