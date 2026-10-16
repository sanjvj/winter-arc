import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-4 auto-rows-[160px]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
