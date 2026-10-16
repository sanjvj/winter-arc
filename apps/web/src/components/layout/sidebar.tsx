'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useDoc, useCollection } from '@/lib/data';
import {
  Settings,
  SettingsSchema,
  DailyLog,
  DailyLogSchema,
  Application,
  ApplicationSchema,
  getOverdueFollowUps,
  todayIST,
  getPlanDayNumberIST,
  calculateStreak,
} from '@winter-arc/shared';
import {
  LayoutDashboard,
  Clock,
  Code2,
  RefreshCw,
  AlertTriangle,
  Briefcase,
  Columns3,
  Mic,
  Map,
  ClipboardCheck,
  Chrome,
  Settings as SettingsIcon,
  Flame,
  LogOut,
  Calendar,
} from 'lucide-react';

export const navigationItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Daily Log', icon: Clock },
  { href: '/dsa', label: 'DSA Tracker', icon: Code2 },
  { href: '/revision', label: 'Spaced Revision', icon: RefreshCw },
  { href: '/mistakes', label: 'Mistakes Log', icon: AlertTriangle },
  { href: '/jobs', label: 'Job Feed', icon: Briefcase },
  { href: '/pipeline', label: 'Pipeline Kanban', icon: Columns3 },
  { href: '/mocks', label: 'Mock Interviews', icon: Mic },
  { href: '/roadmap', label: '90-Day Roadmap', icon: Map },
  { href: '/review', label: 'Weekly Review', icon: ClipboardCheck },
  { href: '/extension', label: 'Autofill Ext', icon: Chrome },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const { data: remoteSettings } = useDoc<Settings>('settings', 'main', SettingsSchema);
  const { data: allLogs } = useCollection<DailyLog>('dailyLogs', DailyLogSchema);
  const { data: allApplications } = useCollection<Application>('applications', ApplicationSchema);

  const today = todayIST();
  const planDay = remoteSettings?.planStartDate
    ? getPlanDayNumberIST(remoteSettings.planStartDate, today)
    : 1;
  const planLength = remoteSettings?.planLengthDays || 90;
  const streak = calculateStreak(allLogs || [], today);
  const overdueFollowUps = getOverdueFollowUps(allApplications || [], today);
  const overdueCount = overdueFollowUps.length;

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-border-token bg-surface p-4 fixed left-0 top-0 z-30">
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-ice/10 text-accent-ice">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Sprint 2026
            </span>
            <h1 className="font-display text-sm font-bold text-text">Winter Arc</h1>
          </div>
        </div>

        {/* Status Chips */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="flex items-center gap-1.5 rounded-xl border border-border-token bg-surface-2 px-2.5 py-1.5"
            title={`Plan Day ${planDay} of ${planLength}`}
          >
            <Calendar className="h-3.5 w-3.5 text-accent-ice" />
            <span className="font-mono text-[11px] font-semibold text-text truncate">
              Day {planDay} of {planLength}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-xl border border-border-token bg-surface-2 px-2.5 py-1.5"
            title={streak.atRisk ? 'Floor not yet completed today' : 'Streak active'}
          >
            <Flame
              className={`h-3.5 w-3.5 ${
                streak.atRisk
                  ? 'text-status-warn animate-pulse'
                  : streak.currentStreak > 0
                    ? 'text-accent-ice'
                    : 'text-muted'
              }`}
            />
            <span className="font-mono text-[11px] font-semibold text-text">
              {streak.currentStreak}d Streak
            </span>
          </div>
        </div>

        {/* Navigation Routes */}
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent-ice/10 text-accent-ice font-semibold'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.href === '/pipeline' && overdueCount > 0 && (
                  <span className="ml-auto rounded-full bg-status-danger/20 border border-status-danger/40 px-1.5 py-0.5 text-[10px] font-mono text-status-danger font-bold">
                    {overdueCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Sign-Out */}
      <div className="border-t border-border-token pt-3">
        <div className="flex items-center justify-between px-2">
          <div className="overflow-hidden">
            <p className="truncate text-xs font-medium text-text">{user?.displayName || 'Owner'}</p>
            <p className="truncate font-mono text-[10px] text-muted">{user?.email}</p>
          </div>
          <button
            onClick={() => void signOut()}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-token bg-surface-2 text-muted transition-colors hover:text-status-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
