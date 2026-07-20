/**
 * AuthContext — global authentication state.
 *
 * Exposes:
 *   user            — full user profile object (or null)
 *   isAuthenticated — boolean
 *   initialLoading  — true while verifying the stored token on first load
 *   login(email, password) → resolves with user data | throws on failure
 *   register(payload)      → resolves with user data | throws on failure
 *   logout()               → clears state + localStorage
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { TOKEN_KEY } from '../api/axiosInstance';

const USER_KEY = 'airsense_user';

const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Hydrate user from localStorage so the page doesn't flash on refresh
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem(TOKEN_KEY),
  );

  // true while we verify the stored token against /me on first mount
  const [initialLoading, setInitialLoading] = useState(
    () => !!localStorage.getItem(TOKEN_KEY),
  );

  // ── On mount: verify the stored token is still valid ──────────────────────
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setInitialLoading(false);
      return;
    }

    authService
      .getMe()
      .then(res => {
        const userData = res.data;
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // Token is expired or revoked
        _clearStorage();
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setInitialLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Internal helpers ──────────────────────────────────────────────────────
  const _persist = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const _clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // ── Public actions ────────────────────────────────────────────────────────

  /**
   * Log in with email and password.
   * 1. POST /login  → receives access_token
   * 2. Stores token so the interceptor picks it up
   * 3. GET  /me     → fetches full user profile
   * Returns the user profile on success; throws on failure.
   */
  const login = async (email, password) => {
    const loginRes = await authService.login({ email, password });
    const { access_token } = loginRes.data;

    // Store token NOW so the interceptor attaches it for the /me call below
    localStorage.setItem(TOKEN_KEY, access_token);

    const meRes  = await authService.getMe();
    const userData = meRes.data;

    _persist(access_token, userData);
    return userData;
  };

  /**
   * Register a new account.
   * Calls POST /register — does NOT log the user in automatically.
   * Returns the created user profile; throws on failure.
   */
  const register = async payload => {
    const res = await authService.register(payload);
    return res.data;
  };

  /**
   * Log out — clears token and user from state + localStorage.
   * Navigation to /login is handled by the caller (ProtectedRoute or Dashboard).
   */
  const logout = () => {
    _clearStorage();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, initialLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
