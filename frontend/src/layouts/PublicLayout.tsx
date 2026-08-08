import { Outlet } from 'react-router';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 border-b glass sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="font-bold text-xl text-primary" data-no-translate>AirSense.AI</div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © 2026 AirSense.AI. All rights reserved.
      </footer>
    </div>
  );
}
