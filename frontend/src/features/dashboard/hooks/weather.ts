// Re-exports from dashboard hooks to avoid duplication and cache key collision.
// Use hooks from dashboard.ts directly in components.
export { useCurrentWeather } from './dashboard';
