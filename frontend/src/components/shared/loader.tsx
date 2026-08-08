import { Loader2 } from 'lucide-react';
export const Spinner = ({ className }: { className?: string }) => <Loader2 className={`animate-spin ${className}`} />;
export const PageLoader = () => <div className="flex h-screen w-full items-center justify-center"><Spinner className="h-10 w-10 text-primary" /></div>;
