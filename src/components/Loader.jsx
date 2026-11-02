import { LoaderCircle } from 'lucide-react';

export function Loader({ label = 'Loading...', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Layered spinner rings */}
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/10" />
        <div className="absolute h-12 w-12 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
        <div className="absolute h-7 w-7 rounded-full border-4 border-transparent border-t-brand-300 animate-spin [animation-duration:0.7s] [animation-direction:reverse]" />
        <LoaderCircle
          size={14}
          className="absolute text-brand-400 animate-pulse"
        />
      </div>
      <span className="text-sm font-medium text-slate-400 tracking-wide">{label}</span>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
    />
  );
}

/* Full-page skeleton card grid */
export function SkeletonCards({ count = 4, cols = 'grid-cols-2 xl:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 sm:${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}
