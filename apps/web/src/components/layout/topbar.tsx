'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { nowInISTDisplay } from '@winter-arc/shared';
import { Sun, Moon, Laptop, CalendarDays } from 'lucide-react';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [istDateString, setIstDateString] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setIstDateString(nowInISTDisplay());
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border-token bg-surface/80 px-6 backdrop-blur-md">
      {/* Today's Date in IST */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted">
        <CalendarDays className="h-4 w-4 text-accent-ice" />
        <span>{istDateString || 'Loading IST Calendar...'}</span>
        <span className="hidden sm:inline-block rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-accent-ice">
          IST (UTC+05:30)
        </span>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center gap-2">
        {mounted && (
          <div className="flex items-center rounded-xl border border-border-token bg-surface-2 p-1">
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-surface text-accent-ice shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-surface text-accent-ice shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Preference"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'system'
                  ? 'bg-surface text-accent-ice shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
