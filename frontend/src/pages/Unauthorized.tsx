import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Unauthorized = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col p-6 text-center bg-background">
      <AlertTriangle className="h-20 w-20 text-destructive mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You do not have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button asChild className="h-11 px-8"><Link to="/dashboard">Return to Dashboard</Link></Button>
    </div>
  );
};
