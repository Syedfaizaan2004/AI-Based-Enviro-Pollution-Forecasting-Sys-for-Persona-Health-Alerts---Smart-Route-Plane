/**
 * axiosInstance — pre-configured Axios instance for all API calls.
 *
 * - baseURL: empty in dev (Vite proxy handles /api/* → localhost:8000)
 * - Request interceptor: auto-attaches JWT from localStorage
 * - Response interceptor: on 401 → clears token and redirects to /login
 */

import axios from 'axios';

export const TOKEN_KEY = 'airsense_token';

const api = axios.create({
  // In dev the Vite proxy (vite.config.js) forwards /api/* → http://localhost:8000
  // In production set VITE_API_URL=https://your-api-domain.com
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach stored JWT ──────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error),
);

// ── Response interceptor — global 401 handler ───────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token is expired / invalid — clean up and redirect to login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('airsense_user');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
