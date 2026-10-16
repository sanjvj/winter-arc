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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border-token bg-bg/85 px-6 backdrop-blur-xl">
      {/* Today's Date in IST */}
      <div className="flex items-center gap-2.5 text-xs font-mono text-muted">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-burgundy/10 border border-accent-burgundy/30 text-accent-burgundy-glow">
          <CalendarDays className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-text">{istDateString || 'IST Synchronized'}</span>
        <span className="hidden sm:inline-block rounded-md bg-surface border border-border-token px-2 py-0.5 text-[10px] text-muted font-mono">
          ASIA/KOLKATA (UTC+05:30)
        </span>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center gap-3">
        {mounted && (
          <div className="flex items-center rounded-xl border border-border-token bg-surface p-1 shadow-sm">
            <button
              onClick={() => setTheme('dark')}
              title="Dark Theme"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-accent-burgundy text-white shadow-burgundy'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              title="Light Theme"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-accent-burgundy text-white shadow-burgundy'
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
                  ? 'bg-accent-burgundy text-white shadow-burgundy'
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
