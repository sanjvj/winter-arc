import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export type BentoCardSize = 'S' | 'M' | 'W' | 'T' | 'L' | 'XL' | 'H';
export type BentoCardState = 'default' | 'loading' | 'empty' | 'error';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: BentoCardSize;
  state?: BentoCardState;
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

const sizeClasses: Record<BentoCardSize, string> = {
  S: 'col-span-1 md:col-span-3 xl:col-span-3 row-span-1',
  M: 'col-span-1 md:col-span-3 xl:col-span-4 row-span-1',
  W: 'col-span-1 md:col-span-6 xl:col-span-6 row-span-1',
  T: 'col-span-1 md:col-span-3 xl:col-span-3 row-span-2',
  L: 'col-span-1 md:col-span-6 xl:col-span-4 row-span-2',
  XL: 'col-span-1 md:col-span-6 xl:col-span-8 row-span-2',
  H: 'col-span-1 md:col-span-6 xl:col-span-8 row-span-1',
};

export function BentoCard({
  size = 'M',
  state = 'default',
  icon,
  title,
  action,
  emptyMessage = 'No data logged yet',
  emptyAction,
  errorMessage = 'Failed to load card metrics',
  onRetry,
  children,
  className,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-bento border border-border-token bg-gradient-to-b from-surface to-surface/95 p-5 transition-all duration-300 hover:-translate-y-[2px] hover:border-accent-burgundy/40 hover:shadow-burgundy before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-accent-burgundy-glow/30 before:to-transparent',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {/* Title Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 border border-border-token text-accent-burgundy-glow shadow-sm">
              {icon}
            </span>
          )}
          {title && (
            <h3 className="font-display text-base font-medium tracking-tight text-text">{title}</h3>
          )}
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>

      {/* Body / State Variants */}
      <div className="relative mt-3 flex-1 flex flex-col justify-center">
        {state === 'loading' && (
          <div className="flex h-full w-full flex-col justify-center gap-2.5 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-surface-2" />
            <div className="h-7 w-1/2 rounded bg-surface-2" />
            <div className="h-3 w-1/3 rounded bg-surface-2" />
          </div>
        )}

        {state === 'empty' && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center p-2">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted">
              <Inbox className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted leading-relaxed">{emptyMessage}</p>
            {emptyAction && <div className="mt-2">{emptyAction}</div>}
          </div>
        )}

        {state === 'error' && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center p-2">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
              <AlertCircle className="h-4 w-4" />
            </div>
            <p className="text-xs text-status-danger leading-relaxed">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-border-token bg-surface-2 px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-surface"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {state === 'default' && children}
      </div>
    </div>
  );
}
