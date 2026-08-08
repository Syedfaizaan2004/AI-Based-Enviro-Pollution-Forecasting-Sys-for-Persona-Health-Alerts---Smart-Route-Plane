import { Outlet } from 'react-router';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

export function AuthLayout() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed right-4 top-4 z-50">
        <LanguageSelector />
      </div>
      <Outlet />
    </div>
  );
}
