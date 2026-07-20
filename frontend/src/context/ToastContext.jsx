/**
 * ToastContext — lightweight in-app notification system.
 *
 * Provides a `useToast()` hook with four methods:
 *   toast.success(message)
 *   toast.error(message)
 *   toast.info(message)
 *   toast.warning(message)
 *
 * Toasts auto-dismiss after `duration` ms (default 4 000).
 * Rendered via a fixed portal at the top-right corner of the viewport.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbCheck, TbX, TbInfoCircle, TbAlertTriangle } from 'react-icons/tb';

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Config per toast type ─────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: {
    bg:     'rgba(7, 31, 22, 0.94)',
    border: 'rgba(134, 239, 172, 0.34)',
    icon:   TbCheck,
    color:  '#86efac',
  },
  error: {
    bg:     'rgba(69, 10, 10, 0.92)',
    border: 'rgba(239, 68, 68, 0.35)',
    icon:   TbX,
    color:  '#f87171',
  },
  info: {
    bg:     'rgba(7, 23, 46, 0.92)',
    border: 'rgba(99, 179, 237, 0.35)',
    icon:   TbInfoCircle,
    color:  '#93c5fd',
  },
  warning: {
    bg:     'rgba(66, 32, 6, 0.92)',
    border: 'rgba(251, 191, 36, 0.35)',
    icon:   TbAlertTriangle,
    color:  '#fbbf24',
  },
};

// ── Single Toast item ─────────────────────────────────────────────────────────
function ToastItem({ id, message, type, onRemove }) {
  const s = TOAST_STYLES[type] ?? TOAST_STYLES.info;
  const Icon = s.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1     }}
      exit={{    opacity: 0, x: 60, scale: 0.88   }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '13px 16px',
        maxWidth: 360,
        width: '100%',
        background: s.bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        fontFamily: 'Poppins, sans-serif',
      }}
      onClick={() => onRemove(id)}
      role="alert"
    >
      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${s.color}18`,
        border: `1px solid ${s.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <Icon size={14} color={s.color} />
      </div>

      {/* Message */}
      <p style={{ fontSize: 13, color: '#edfdf3', lineHeight: 1.55, flex: 1, margin: 0 }}>
        {message}
      </p>

      {/* Dismiss × */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onRemove(id); }}
        aria-label="Dismiss"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#83a694', padding: 2, lineHeight: 1, flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#bbf7d0'}
        onMouseLeave={e => e.currentTarget.style.color = '#83a694'}
      >
        <TbX size={15} />
      </button>
    </motion.div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((message, type = 'info', duration = 4500) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const toast = {
    success: msg => add(msg, 'success'),
    error:   msg => add(msg, 'error'),
    info:    msg => add(msg, 'info'),
    warning: msg => add(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* ── Toast portal (fixed top-right) ─────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem {...t} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export default ToastContext;
