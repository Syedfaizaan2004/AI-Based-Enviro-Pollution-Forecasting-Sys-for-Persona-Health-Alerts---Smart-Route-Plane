import { Link } from 'react-router';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SessionExpired = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col p-6 text-center bg-background">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Clock className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Session Expired</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        For your security, you have been automatically logged out due to inactivity. Please log in again to continue.
      </p>
      <Button asChild className="h-11 px-8"><Link to="/login">Log back in</Link></Button>
    </div>
  );
};
