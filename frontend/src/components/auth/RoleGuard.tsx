import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
