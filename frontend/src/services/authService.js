/**
 * authService — thin wrappers around auth API endpoints.
 *
 * All functions return Axios response objects; callers handle .data extraction.
 */

import api from '../api/axiosInstance';

const authService = {
  /** POST /api/v1/auth/register — create a new account */
  register: payload => api.post('/api/v1/auth/register', payload),

  /** POST /api/v1/auth/login — exchange email+password for JWT */
  login: payload => api.post('/api/v1/auth/login', payload),

  /** GET /api/v1/auth/me — fetch the authenticated user's profile */
  getMe: () => api.get('/api/v1/auth/me'),
};

export default authService;

// ── Helper: extract a human-readable error string from any Axios error ──────
export function extractApiError(error) {
  const data = error?.response?.data;
  if (!data) return 'Network error — please check your connection and try again.';

  const { detail } = data;
  if (typeof detail === 'string') return detail;

  // FastAPI 422 returns an array of validation errors
  if (Array.isArray(detail)) {
    return detail
      .map(d => d.msg ?? d.message ?? JSON.stringify(d))
      .filter(Boolean)
      .join('. ');
  }

  return 'Something went wrong. Please try again.';
}
