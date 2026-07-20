/**
 * App — root component.
 *
 * Provider order (outermost → innermost):
 *   BrowserRouter   — routing context
 *   AuthProvider    — JWT + user state
 *   ToastProvider   — toast notifications (rendered as fixed portal)
 *   AppRoutes       — page routing
 */

import { BrowserRouter }  from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { ToastProvider }  from './context/ToastContext';
import AppRoutes          from './routes/AppRoutes';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
