import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/auth';

function SessionValidator({ children }: { children: React.ReactNode }) {
  const { accessToken, setSession, clearSession, user } = useAuthStore();
  
  useEffect(() => {
    if (accessToken && user) {
      // Validate the session by calling /auth/me
      authService.me().then((freshUser) => {
        setSession(accessToken, useAuthStore.getState().refreshToken!, { ...user, ...freshUser });
      }).catch(() => {
        // Token is invalid — clear session (interceptor will handle redirect)
        clearSession();
      });
    }
  // Run only once on app start
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionValidator>
          {children}
        </SessionValidator>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
