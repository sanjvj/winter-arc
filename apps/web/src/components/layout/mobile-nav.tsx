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
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md md:hidden">
          <div className="rounded-t-3xl border-t border-white/10 bg-[#0B0B0F] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-display text-base font-bold text-white tracking-wide uppercase">
                Command Modules
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400 hover:text-white"
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
                      'flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium transition-all',
                      isActive
                        ? 'border-white/20 bg-[#6D001A] text-white font-semibold shadow-burgundy'
                        : 'border-white/5 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-status-danger/30 bg-status-danger/10 py-2.5 text-xs font-semibold text-status-danger hover:bg-status-danger/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-[#050507]/90 backdrop-blur-xl px-2 md:hidden">
        <Link
          href="/"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            (normalizedPath === '' || normalizedPath === '/') ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/log"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            normalizedPath === '/log' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          <Clock className="h-4 w-4" />
          <span>Log</span>
        </Link>

        {/* Floating Quick-Log Button */}
        <Link
          href="/log"
          title="Quick Daily Log"
          className="-mt-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B0022] to-[#6D001A] text-white shadow-burgundy ring-2 ring-white/20 transition-transform active:scale-95 p-3"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </Link>

        <Link
          href="/dsa"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            normalizedPath === '/dsa' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          <Code2 className="h-4 w-4" />
          <span>DSA</span>
        </Link>

        <Link
          href="/jobs"
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            normalizedPath === '/jobs' ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          <Briefcase className="h-4 w-4" />
          <span>Jobs</span>
        </Link>

        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
            moreOpen ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300',
          )}
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
