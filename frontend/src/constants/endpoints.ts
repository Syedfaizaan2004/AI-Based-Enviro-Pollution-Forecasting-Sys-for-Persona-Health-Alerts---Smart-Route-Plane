// Centralized API endpoint constants.
// Note: Feature-specific endpoints are defined in each feature's own services/endpoints.ts file.
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  PREDICTION: {
    PREDICT: '/predictions/predict',
  },
};
