import { LoaderCircle } from 'lucide-react';

export function Loader({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${className}`} role="status" aria-live="polite">
      <LoaderCircle className="animate-spin text-brand-600" size={18} />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} aria-hidden="true" />;
}
