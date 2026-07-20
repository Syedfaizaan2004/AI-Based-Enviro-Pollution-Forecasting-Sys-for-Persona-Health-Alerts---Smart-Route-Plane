/**
 * AppRoutes — centralised routing configuration.
 *
 * Public routes  : /login, /signup
 * Protected route: /dashboard — requires valid JWT (via ProtectedRoute)
 *
 * AnimatePresence with mode="wait" ensures page exit animations
 * complete before the next page mounts.
 */

import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import ProtectedRoute from '../components/router/ProtectedRoute';
import Login          from '../pages/Login';
import Signup         from '../pages/Signup';
import Dashboard      from '../pages/Dashboard';

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>

        {/* ── Public ──────────────────────────────────────────────── */}
        <Route path="/login"  element={<Login  />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Protected ───────────────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Default redirect ────────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />

        {/* Week 2+ routes will be added here:
            <Route path="/map"     element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="/alerts"  element={<ProtectedRoute><Alerts  /></ProtectedRoute>} />
        */}
      </Routes>
    </AnimatePresence>
  );
}
