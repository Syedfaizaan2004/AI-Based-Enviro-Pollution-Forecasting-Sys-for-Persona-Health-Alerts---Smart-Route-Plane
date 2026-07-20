/**
 * Signup - connected to POST /api/v1/auth/register.
 *
 * On success - create account, sign in, then navigate /dashboard.
 * On failure - toast error with API's detail message.
 */

import { useState }           from 'react';
import { Link, useNavigate }  from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import {
  TbLeaf, TbUser, TbMail, TbCalendar,
  TbHeartbeat, TbBell, TbArrowRight,
  TbWind, TbActivity,
} from 'react-icons/tb';
import { HiMail } from 'react-icons/hi';

import AnimatedBackground  from '../components/ui/AnimatedBackground';
import PasswordInput       from '../components/ui/PasswordInput';
import SearchableDropdown  from '../components/ui/SearchableDropdown';
import AutocompleteInput   from '../components/ui/AutocompleteInput';
import { useAuth }         from '../context/AuthContext';
import { useToast }        from '../context/ToastContext';
import { extractApiError } from '../services/authService';

// ── Static data ───────────────────────────────────────────────────────────────
const HEALTH_OPTIONS  = ['Asthma', 'Heart Disease', 'Respiratory Disease', 'Pregnant', 'Senior Citizen', 'Child', 'Other'];
const PURPOSE_OPTIONS = ['Office', 'Travel', 'School', 'Hospital', 'Shopping', 'Other'];
const NOTIFICATION_OPTIONS = [
  { id: 'notif-email', name: 'notifEmail', label: 'Email',             icon: '✉️' },
  { id: 'notif-sms',   name: 'notifSMS',   label: 'SMS',               icon: '📱' },
  { id: 'notif-push',  name: 'notifPush',  label: 'Push Notification', icon: '🔔' },
];

// ── Animations ────────────────────────────────────────────────────────────────
const pageAnim = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.28 } },
};
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0,  transition: { delay, duration: 0.45, ease: 'easeOut' } },
});

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label, accent = '#86efac' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 20px' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: `${accent}15`, border: `1px solid ${accent}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={accent} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0,
        textTransform: 'uppercase', color: '#b7d8c4' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(187,247,208,0.12)' }} />
    </div>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      style={{ color: '#ef4444', fontSize: 12, marginTop: 5 }}>
      ⚠ {error.message}
    </motion.p>
  );
}

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

function FormField({ label, id, error, iconLeft, required, children }) {
  return (
    <div>
      <label className="auth-label" htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}{required && <span style={{ color: '#ef4444', fontSize: 10 }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {iconLeft && (
          <span style={{
            position: 'absolute', left: 13, top: '50%',
            transform: 'translateY(-50%)', color: '#3d6b57', pointerEvents: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            {iconLeft}
          </span>
        )}
        {children}
      </div>
      <FieldError error={error} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Signup() {
  const [loading, setLoading] = useState(false);

  const { register: authRegister, login: authLogin } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({ mode: 'onTouched' });
  const passwordValue = watch('password');

  // ── Build API payload from form values ───────────────────────────────────────
  const buildPayload = data => ({
    first_name:     data.firstName,
    middle_name:    data.middleName  || null,
    last_name:      data.lastName,
    username:       data.username,
    email:          data.email,
    password:       data.password,
    date_of_birth:  data.dob         || null,
    health_issue:   data.healthIssue || null,
    place_to_visit: data.placeToVisit || null,
  });

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async data => {
    setLoading(true);
    try {
      await authRegister(buildPayload(data));
      await authLogin(data.email, data.password);
      toast.success('Account created. Welcome to your dashboard.');
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
        alignItems: 'center', justifyContent: 'flex-start',
        padding: '40px 16px 60px',
        position: 'relative',
        background: 'linear-gradient(135deg, #03100b 0%, #08231c 45%, #14190c 100%)',
      }}
    >
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '680px' }}>

        {/* Logo */}
        <motion.div {...fadeUp(0.05)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24,
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
            borderBottom: '1px solid rgba(187,247,208,0.12)',
            padding: '28px 36px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f0fdf4', margin: 0, marginBottom: 4 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 13, color: '#83a694', margin: 0 }}>
                Join AirSense.AI for cleaner routes and health-aware air alerts
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px',
                background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.18)',
                borderRadius: 8,
              }}>
                <TbActivity size={13} color="#86efac" />
                <span style={{ fontSize: 12, color: '#bbf7d0', fontWeight: 700 }}>AQI 42 - Good</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px',
                background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)',
                borderRadius: 8,
              }}>
                <TbWind size={12} color="#06b6d4" />
                <span style={{ fontSize: 11, color: '#22d3ee' }}>PM2.5: 12 μg/m³</span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: '32px 36px 40px' }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* ── 1. PERSONAL INFO ───────────────────────────────── */}
              <SectionHeading icon={TbUser} label="Personal Information" accent="#86efac" />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <FormField label="First Name" id="firstName" error={errors.firstName} required>
                  <input id="firstName" type="text" placeholder="Syed"
                    className={`auth-input${errors.firstName ? ' error' : ''}`}
                    {...register('firstName', { required: 'First name is required.', minLength: { value: 2, message: 'Min 2 characters.' } })}
                  />
                </FormField>
                <FormField label="Last Name" id="lastName" error={errors.lastName} required>
                  <input id="lastName" type="text" placeholder="Ahmad"
                    className={`auth-input${errors.lastName ? ' error' : ''}`}
                    {...register('lastName', { required: 'Last name is required.', minLength: { value: 2, message: 'Min 2 characters.' } })}
                  />
                </FormField>
              </div>

              <FormField label="Middle Name" id="middleName" error={errors.middleName}>
                <input id="middleName" type="text" placeholder="Faizaan (optional)"
                  className="auth-input" {...register('middleName')} />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <FormField label="Username" id="username" error={errors.username}
                  iconLeft={<TbUser size={15} />} required>
                  <input id="username" type="text" placeholder="sfaizaan"
                    className={`auth-input${errors.username ? ' error' : ''}`}
                    style={{ paddingLeft: '36px' }}
                    {...register('username', {
                      required: 'Username is required.',
                      minLength: { value: 3, message: 'Min 3 characters.' },
                      maxLength: { value: 50, message: 'Max 50 characters.' },
                      pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, digits and underscores only.' },
                    })}
                  />
                </FormField>
                <FormField label="Date of Birth" id="dob" error={errors.dob}
                  iconLeft={<TbCalendar size={15} />}>
                  <input id="dob" type="date" className="auth-input"
                    style={{ paddingLeft: '36px', colorScheme: 'dark' }}
                    {...register('dob')}
                  />
                </FormField>
              </div>

              {/* ── 2. ACCOUNT SECURITY ─────────────────────────────── */}
              <SectionHeading icon={TbMail} label="Account Security" accent="#22d3ee" />

              <FormField label="Email Address" id="email" error={errors.email}
                iconLeft={<HiMail size={15} />} required>
                <input id="email" type="email" placeholder="you@example.com" autoComplete="email"
                  className={`auth-input${errors.email ? ' error' : ''}`}
                  style={{ paddingLeft: '36px' }}
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
                  })}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <PasswordInput label="Password *" name="password" id="reg-password"
                  placeholder="Min 8 characters"
                  register={register('password', {
                    required: 'Password is required.',
                    minLength: { value: 8, message: 'Min 8 characters.' },
                  })}
                  error={errors.password}
                />
                <PasswordInput label="Confirm Password *" name="confirmPassword" id="reg-confirm"
                  placeholder="Re-enter password"
                  register={register('confirmPassword', {
                    required: 'Please confirm your password.',
                    validate: v => v === passwordValue || 'Passwords do not match.',
                  })}
                  error={errors.confirmPassword}
                />
              </div>

              {/* ── 3. HEALTH & PREFERENCES ─────────────────────────── */}
              <SectionHeading icon={TbHeartbeat} label="Health & Environmental Preferences" accent="#a78bfa" />

              <Controller name="healthIssue" control={control} defaultValue=""
                render={({ field, fieldState }) => (
                  <SearchableDropdown label="Health Condition" options={HEALTH_OPTIONS}
                    value={field.value} onChange={field.onChange}
                    placeholder="Select your health condition (optional)"
                    error={fieldState.error}
                  />
                )}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <Controller name="placeToVisit" control={control} defaultValue=""
                  render={({ field, fieldState }) => (
                    <AutocompleteInput label="Place to Visit" value={field.value}
                      onChange={field.onChange} onBlur={field.onBlur}
                      placeholder="e.g. Connaught Place, Delhi"
                      name="placeToVisit" error={fieldState.error}
                    />
                  )}
                />
                <Controller name="purposeOfVisit" control={control} defaultValue=""
                  render={({ field, fieldState }) => (
                    <SearchableDropdown label="Purpose of Visit" options={PURPOSE_OPTIONS}
                      value={field.value} onChange={field.onChange}
                      placeholder="Select purpose" error={fieldState.error}
                    />
                  )}
                />
              </div>

              {/* ── 4. NOTIFICATIONS & TERMS ────────────────────────── */}
              <SectionHeading icon={TbBell} label="Notifications & Terms" accent="#fbbf24" />

              <div>
                <label className="auth-label">Notification Preferences</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  {NOTIFICATION_OPTIONS.map(opt => (
                    <label key={opt.id} htmlFor={opt.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px',
                      background: 'rgba(242,252,244,0.055)',
                      border: '1px solid rgba(187,247,208,0.14)',
                      borderRadius: 8, cursor: 'pointer', flex: '1 0 auto',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(134,239,172,0.32)';
                        e.currentTarget.style.background  = 'rgba(134,239,172,0.08)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(187,247,208,0.14)';
                        e.currentTarget.style.background  = 'rgba(242,252,244,0.055)';
                      }}
                    >
                      <input id={opt.id} type="checkbox" className="auth-checkbox" {...register(opt.name)} />
                      <span style={{ fontSize: 13 }}>{opt.icon}</span>
                      <span style={{ fontSize: 13, color: '#b7d8c4' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="acceptTerms" style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '14px 16px', cursor: 'pointer',
                  background: errors.acceptTerms ? 'rgba(239,68,68,0.08)' : 'rgba(242,252,244,0.055)',
                  border: `1px solid ${errors.acceptTerms ? 'rgba(239,68,68,0.3)' : 'rgba(187,247,208,0.14)'}`,
                  borderRadius: 8, transition: 'all 0.2s',
                }}>
                  <input id="acceptTerms" type="checkbox" className="auth-checkbox" style={{ marginTop: 2 }}
                    {...register('acceptTerms', { required: 'You must accept the terms to continue.' })}
                  />
                  <span style={{ fontSize: 13, color: '#b7d8c4', lineHeight: 1.6 }}>
                    I agree to the{' '}
                    <span style={{ color: '#86efac', fontWeight: 700, cursor: 'pointer' }}>Terms of Service</span>
                    {' '}and{' '}
                    <span style={{ color: '#86efac', fontWeight: 700, cursor: 'pointer' }}>Privacy Policy</span>.
                    I understand my data will be used for personalised pollution &amp; health alerts.
                  </span>
                </label>
                <FieldError error={errors.acceptTerms} />
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                className="auth-btn-primary"
                whileHover={!loading ? { scale: 1.015 } : {}}
                whileTap={!loading  ? { scale: 0.985 } : {}}
                style={{ marginTop: 6, paddingTop: 15, paddingBottom: 15 }}
              >
                {loading ? (
                  <><Spinner /><span style={{ marginLeft: 8 }}>Creating account…</span></>
                ) : (
                  <>
                    Create Account
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <TbArrowRight size={18} />
                    </motion.span>
                  </>
                )}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#83a694' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#86efac', fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#bef264'}
                  onMouseLeave={e => e.currentTarget.style.color = '#86efac'}
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>

        <motion.p {...fadeUp(0.3)} style={{ textAlign: 'center', fontSize: 11, color: '#5f7f70', marginTop: 20 }}>
          AI-Based Environmental Pollution Forecasting System - Final Year Project 2026
        </motion.p>
      </div>
    </motion.div>
  );
}
