/**
 * Login - connected to POST /api/v1/auth/login.
 *
 * On success - stores JWT via AuthContext, then navigate /dashboard.
 * On failure - shows toast error with the API's detail message.
 */

import { useState }       from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm }        from 'react-hook-form';
import {
  TbLeaf, TbArrowRight, TbWind, TbDroplet, TbActivity, TbShieldCheck, TbMapPin,
} from 'react-icons/tb';
import { HiMail } from 'react-icons/hi';

import AnimatedBackground        from '../components/ui/AnimatedBackground';
import PasswordInput             from '../components/ui/PasswordInput';
import { useAuth }               from '../context/AuthContext';
import { useToast }              from '../context/ToastContext';
import { extractApiError }       from '../services/authService';

// ── Animation helpers ─────────────────────────────────────────────────────────
const pageAnim = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.28 } },
};
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0,  transition: { delay, duration: 0.45, ease: 'easeOut' } },
});

// ── Live AQI bar data (static placeholder) ────────────────────────────────────
const AQI_STATS = [
  { icon: TbActivity, label: 'AQI',   value: '42',  unit: 'Good',  color: '#10b981' },
  { icon: TbWind,     label: 'PM2.5', value: '12',  unit: 'μg/m³', color: '#06b6d4' },
  { icon: TbDroplet,  label: 'Hum.',  value: '68%', unit: 'Rel.',  color: '#818cf8' },
];

const FEATURES = [
  { icon: TbActivity,    text: 'Real-time AQI' },
  { icon: TbShieldCheck, text: 'Health Alerts'  },
  { icon: TbMapPin,      text: 'Smart Routes'   },
  { icon: TbLeaf,        text: 'Eco Insights'   },
];

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      style={{
        display: 'inline-block', width: 19, height: 19,
        border: '2.5px solid rgba(255,255,255,0.25)',
        borderTopColor: '#fff', borderRadius: '50%',
      }}
    />
  );
}

function LiveDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
      <motion.span
        animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981' }}
      />
      <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Login() {
  const [loading, setLoading] = useState(false);

  const { login }     = useAuth();
  const toast         = useToast();
  const navigate      = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onTouched' });

  // ── Form submit ─────────────────────────────────────────────────────────────
  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageAnim} initial="hidden" animate="visible" exit="exit"
      style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        background: 'linear-gradient(135deg, #03100b 0%, #08231c 45%, #14190c 100%)',
      }}
    >
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '500px' }}>

        {/* App logo */}
        <motion.div {...fadeUp(0.05)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, marginBottom: 24,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            background: 'linear-gradient(135deg, #16a34a 0%, #0891b2 62%, #84cc16 130%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(22,163,74,0.28)',
            border: '1px solid rgba(220,252,231,0.22)',
          }}>
            <TbLeaf size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#f0fdf4', letterSpacing: 0, lineHeight: 1 }}>
              AirSense<span style={{ color: '#bef264' }}>.AI</span>
            </div>
            <div style={{ fontSize: 10, color: '#83a694', letterSpacing: 0, textTransform: 'uppercase', fontWeight: 600 }}>
              Clean Air Intelligence
            </div>
          </div>
        </motion.div>

        {/* Glass card */}
        <motion.div {...fadeUp(0.1)} className="eco-panel" style={{ overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(22,163,74,0.22) 0%, rgba(8,145,178,0.16) 58%, rgba(132,204,22,0.08) 100%)',
            borderBottom: '1px solid rgba(187,247,208,0.12)', padding: '28px 36px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              <LiveDot />
              <span style={{ fontSize: 11, color: '#bbf7d0', fontWeight: 700, letterSpacing: 0 }}>
                LOCAL AIR SNAPSHOT
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {AQI_STATS.map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(3,16,11,0.42)',
                  border: `1px solid ${s.color}28`,
                  borderRadius: 8, flex: '1 0 auto',
                }}>
                  <s.icon size={13} color={s.color} />
                  <span style={{ fontSize: 11, color: '#9bb8aa', fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 13, color: s.color, fontWeight: 700, marginLeft: 2 }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: '#83a694' }}>{s.unit}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {FEATURES.map(f => (
                <div key={f.text} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px',
                  background: 'rgba(134,239,172,0.08)',
                  border: '1px solid rgba(134,239,172,0.14)',
                  borderRadius: 8,
                }}>
                  <f.icon size={11} color="#86efac" />
                  <span style={{ fontSize: 11, color: '#bbf7d0', fontWeight: 600 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: '32px 36px 36px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0fdf4', marginBottom: 4 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13, color: '#83a694', marginBottom: 28 }}>
              Sign in to track cleaner routes and health-aware air quality.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label className="auth-label" htmlFor="login-email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <HiMail size={15} style={{
                    position: 'absolute', left: 13, top: '50%',
                    transform: 'translateY(-50%)', color: '#3d6b57', pointerEvents: 'none',
                  }} />
                  <input
                    id="login-email" type="email"
                    placeholder="you@example.com" autoComplete="email"
                    className={`auth-input${errors.email ? ' error' : ''}`}
                    style={{ paddingLeft: '36px' }}
                    {...register('email', {
                      required: 'Email is required.',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                    })}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>
                    ⚠ {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <PasswordInput
                label="Password" id="login-password" name="password"
                placeholder="Enter your password"
                register={register('password', {
                  required: 'Password is required.',
                  minLength: { value: 8, message: 'Must be at least 8 characters.' },
                })}
                error={errors.password}
              />

              {/* Remember me + Forgot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" id="remember-me" className="auth-checkbox" {...register('rememberMe')} />
                  <span style={{ fontSize: 13, color: '#9bb8aa' }}>Remember me</span>
                </label>
                <button type="button"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: '#86efac', fontFamily: 'Poppins, sans-serif', padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#bef264'}
                  onMouseLeave={e => e.currentTarget.style.color = '#86efac'}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                className="auth-btn-primary"
                whileHover={!loading ? { scale: 1.015 } : {}}
                whileTap={!loading  ? { scale: 0.985 } : {}}
                style={{ marginTop: 6 }}
              >
                {loading ? (
                  <><Spinner /><span style={{ marginLeft: 8 }}>Signing in…</span></>
                ) : (
                  <>
                    Sign In
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <TbArrowRight size={18} />
                    </motion.span>
                  </>
                )}
              </motion.button>

              <div className="auth-divider"><span>or</span></div>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#83a694' }}>
                New to AirSense?{' '}
                <Link to="/signup" style={{ color: '#86efac', fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#bef264'}
                  onMouseLeave={e => e.currentTarget.style.color = '#86efac'}
                >
                  Create free account
                </Link>
              </p>
            </form>
          </div>
        </motion.div>

        <motion.p {...fadeUp(0.3)} style={{ textAlign: 'center', fontSize: 11, color: '#5f7f70', marginTop: 20 }}>
          AI-Based Environmental Pollution Forecasting - Final Year Project 2026
        </motion.p>
      </div>
    </motion.div>
  );
}
