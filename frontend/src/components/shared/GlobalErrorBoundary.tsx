import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border/50 text-center shadow-xl">
            <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-6">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              We encountered an unexpected error. Please try refreshing the page or navigating back home.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
