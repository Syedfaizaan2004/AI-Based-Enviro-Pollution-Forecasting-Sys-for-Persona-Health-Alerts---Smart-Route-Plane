import { apiClient } from './client';
import { setupInterceptors } from './interceptors';

// Initialize interceptors
setupInterceptors();

export { apiClient as api };
