import { Outlet } from 'react-router';
import { ChatBot } from '@/features/chat/components/ChatBot';

export function AdminLayout() {
  return (
    <div className="min-h-screen w-full relative">
      <Outlet />
      <ChatBot />
    </div>
  );
}
