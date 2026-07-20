/**
 * ProtectedRoute — renders children only for authenticated users.
 *
 * While the token is being verified on first load (initialLoading),
 * a full-screen spinner is shown so there is no flash of the login page.
 * Once verified, unauthenticated users are redirected to /login.
 */

import { Navigate } from 'react-router-dom';
import { motion }   from 'framer-motion';
import { TbLeaf }   from 'react-icons/tb';
import { useAuth }  from '../../context/AuthContext';

// ── Full-screen initial-load spinner ─────────────────────────────────────────
function FullPageSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      background: 'linear-gradient(135deg, #03100b 0%, #08231c 45%, #14190c 100%)',
    }}>
      {/* Logo */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 52, height: 52, borderRadius: 8,
          background: 'linear-gradient(135deg, #16a34a 0%, #0891b2 62%, #84cc16 130%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(22,163,74,0.3)',
        }}
      >
        <TbLeaf size={26} color="#fff" />
      </motion.div>

      {/* Spinner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 32, height: 32,
          border: '3px solid rgba(134, 239, 172, 0.16)',
          borderTopColor: '#86efac',
          borderRadius: '50%',
        }}
      />

      <p style={{
        fontSize: 13, color: '#83a694',
        fontFamily: 'Poppins, sans-serif',
        letterSpacing: 0,
      }}>
        Verifying session…
      </p>
    </div>
  );
}

// ── Guard ─────────────────────────────────────────────────────────────────────
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialLoading } = useAuth();

  if (initialLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
