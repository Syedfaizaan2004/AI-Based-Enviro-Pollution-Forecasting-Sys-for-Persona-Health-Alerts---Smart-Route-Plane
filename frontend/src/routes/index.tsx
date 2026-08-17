import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { PageTranslator } from '@/components/shared/PageTranslator';
import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/shared/loader';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';

const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('@/pages/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const EmailVerification = lazy(() => import('@/pages/EmailVerification').then(m => ({ default: m.EmailVerification })));
const Unauthorized = lazy(() => import('@/pages/Unauthorized').then(m => ({ default: m.Unauthorized })));
const SessionExpired = lazy(() => import('@/pages/SessionExpired').then(m => ({ default: m.SessionExpired })));

const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Health = lazy(() => import('@/pages/Health').then(m => ({ default: m.Health })));
const Prediction = lazy(() => import('@/pages/Prediction').then(m => ({ default: m.Prediction })));
const Routes = lazy(() => import('@/pages/Routes').then(m => ({ default: m.Routes })));
const History = lazy(() => import('@/pages/History').then(m => ({ default: m.History })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const Admin = lazy(() => import('@/pages/Admin').then(m => ({ default: m.Admin })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));

const router = createBrowserRouter([
  {
    element: (
      <>
        <PageTranslator />
        <Outlet />
      </>
    ),
    errorElement: (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-4xl font-black text-destructive">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred. Please refresh the page.</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">Go Home</a>
      </div>
    ),
    children: [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: 'verify-email', element: <Suspense fallback={<PageLoader />}><EmailVerification /></Suspense> },
      { path: 'unauthorized', element: <Suspense fallback={<PageLoader />}><Unauthorized /></Suspense> },
      { path: 'session-expired', element: <Suspense fallback={<PageLoader />}><SessionExpired /></Suspense> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
          { path: 'signup', element: <Suspense fallback={<PageLoader />}><Signup /></Suspense> },
          { path: 'forgot-password', element: <Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense> },
          { path: 'reset-password', element: <Suspense fallback={<PageLoader />}><ResetPassword /></Suspense> },
        ],
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGuard allowedRoles={['user']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
          { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
          { path: 'health', element: <Suspense fallback={<PageLoader />}><Health /></Suspense> },
          { path: 'prediction', element: <Suspense fallback={<PageLoader />}><Prediction /></Suspense> },
          { path: 'routes', element: <Suspense fallback={<PageLoader />}><Routes /></Suspense> },
          { path: 'history', element: <Suspense fallback={<PageLoader />}><History /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<PageLoader />}><Profile /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<PageLoader />}><Settings /></Suspense> },
            ],
          }
        ]
      },
      {
        element: <RoleGuard allowedRoles={['admin', 'super_admin']} />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Suspense fallback={<PageLoader />}><Admin /></Suspense> },
            ],
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Suspense fallback={<PageLoader />}><NotFound /></Suspense>,
  },
    ],
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
