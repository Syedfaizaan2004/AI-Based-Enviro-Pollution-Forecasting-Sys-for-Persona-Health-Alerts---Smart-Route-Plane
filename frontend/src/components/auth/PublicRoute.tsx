import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/authStore';

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
