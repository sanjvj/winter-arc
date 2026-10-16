'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  Code2,
  Briefcase,
  Menu,
  Plus,
  X,
  RefreshCw,
  AlertTriangle,
  Columns3,
  Mic,
  Map,
  ClipboardCheck,
  Chrome,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function MobileNav() {
  const pathname = usePathname();
  const normalizedPath = pathname && pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname || '';
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreItems = [
    { href: '/revision', label: 'Spaced Revision', icon: RefreshCw },
    { href: '/mistakes', label: 'Mistakes Log', icon: AlertTriangle },
    { href: '/pipeline', label: 'Pipeline Kanban', icon: Columns3 },
    { href: '/mocks', label: 'Mock Interviews', icon: Mic },
    { href: '/roadmap', label: '90-Day Roadmap', icon: Map },
    { href: '/review', label: 'Weekly Review', icon: ClipboardCheck },
    { href: '/extension', label: 'Autofill Ext', icon: Chrome },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* "More" Drawer Modal */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-bg/80 backdrop-blur-sm md:hidden">
          <div className="rounded-t-2xl border-t border-border-token bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border-token">
              <h3 className="font-display text-sm font-bold text-text">More Command Modules</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = normalizedPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border border-border-token p-3 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-accent-ice/10 text-accent-ice font-semibold'
                        : 'bg-surface-2 text-muted hover:text-text',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border-token">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-status-danger/20 bg-status-danger/10 py-2.5 text-xs font-semibold text-status-danger"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border-token bg-surface px-2 md:hidden">
        <Link
          href="/"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            (normalizedPath === '' || normalizedPath === '/') ? 'text-accent-ice' : 'text-muted',
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/log"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            normalizedPath === '/log' ? 'text-accent-ice' : 'text-muted',
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Log</span>
        </Link>

        {/* Floating Quick-Log Button */}
        <Link
          href="/log"
          title="Quick Daily Log"
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-ice text-bg shadow-lg shadow-accent-ice/30 transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </Link>

        <Link
          href="/dsa"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            normalizedPath === '/dsa' ? 'text-accent-ice' : 'text-muted',
          )}
        >
          <Code2 className="h-4 w-4" />
          <span>DSA</span>
        </Link>

        <Link
          href="/jobs"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            normalizedPath === '/jobs' ? 'text-accent-ice' : 'text-muted',
          )}
        >
          <Briefcase className="h-4 w-4" />
          <span>Jobs</span>
        </Link>

        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            moreOpen ? 'text-accent-ice' : 'text-muted',
          )}
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
