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
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const navigationGroups = [
  {
    label: 'OPERATIONS',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/log', label: 'Daily Log', icon: Clock },
      { href: '/dsa', label: 'DSA Problems', icon: Code2 },
      { href: '/jobs', label: 'Job Feed', icon: Briefcase },
    ],
  },
  {
    label: 'EXECUTION',
    items: [
      { href: '/revision', label: 'Spaced Revision', icon: RefreshCw },
      { href: '/mistakes', label: 'Mistakes Log', icon: AlertTriangle },
      { href: '/pipeline', label: 'Pipeline Kanban', icon: Columns3 },
      { href: '/mocks', label: 'Mock Interviews', icon: Mic },
    ],
  },
  {
    label: 'GOVERNANCE',
    items: [
      { href: '/roadmap', label: '90-Day Roadmap', icon: Map },
      { href: '/review', label: 'Weekly Review', icon: ClipboardCheck },
      { href: '/extension', label: 'Autofill Ext', icon: Chrome },
      { href: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const normalizedPath = pathname && pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname || '';
  const { user, signOut } = useAuth();

  const { data: remoteSettings } = useDoc<Settings>('settings', 'main', SettingsSchema);
  const { data: allLogs } = useCollection<DailyLog>('dailyLogs', DailyLogSchema);
  const { data: allApplications } = useCollection<Application>('applications', ApplicationSchema);

  const today = todayIST();
  const planDay = remoteSettings?.planStartDate
    ? getPlanDayNumberIST(remoteSettings.planStartDate, today)
    : 1;
  const planLength = remoteSettings?.planLengthDays || 90;
  const progressPct = Math.min(100, Math.round((planDay / planLength) * 100));

  const streak = calculateStreak(allLogs || [], today);
  const overdueFollowUps = getOverdueFollowUps(allApplications || [], today);
  const overdueCount = overdueFollowUps.length;

  return (
    <aside className="hidden md:flex h-screen w-72 flex-col justify-between border-r border-white/10 bg-[#050507] p-4 fixed left-0 top-0 z-30 shadow-2xl selection:bg-[#6D001A] selection:text-white">
      {/* Ambient Burgundy Glow Overlay */}
      <div className="pointer-events-none absolute left-0 top-0 h-56 w-full bg-gradient-to-b from-[#6D001A]/20 via-transparent to-transparent opacity-60" />

      <div className="relative flex flex-col gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-2 pb-1 border-b border-white/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B0022] to-[#6D001A] shadow-glow text-white ring-1 ring-white/20">
            <Flame className="h-6 w-6 fill-white/20 stroke-[2.2]" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#A30028]">
                PROTOCOL CAESAR
              </span>
            </div>
            <h1 className="font-display text-lg font-black tracking-tight text-white uppercase">
              Winter Arc
            </h1>
          </div>
        </div>

        {/* Telemetry HUD Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0B0F] p-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-zinc-400 pb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6D001A] animate-pulse" />
              SPRINT TELEMETRY
            </span>
            <span className="text-white font-semibold">DAY {planDay}/{planLength}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-white/5 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6D001A] to-[#A30028] transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>

          {/* HUD Pills */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <div
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] py-1 px-2 text-[11px] font-mono font-semibold"
              title={`${streak.currentStreak} Day Consecutive Streak`}
            >
              <Flame
                className={`h-3.5 w-3.5 ${
                  streak.atRisk
                    ? 'text-status-warn animate-pulse'
                    : streak.currentStreak > 0
                      ? 'text-[#A30028] fill-[#6D001A]'
                      : 'text-zinc-600'
                }`}
              />
              <span className="text-white">{streak.currentStreak}d Streak</span>
            </div>

            <div
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] py-1 px-2 text-[10px] font-mono font-semibold text-zinc-300 truncate"
              title="Daily Floor Target Protocol"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  streak.atRisk ? 'bg-status-warn' : streak.currentStreak > 0 ? 'bg-status-success' : 'bg-zinc-600'
                }`}
              />
              <span className="truncate">{streak.atRisk ? 'Floor Open' : 'Floor Locked'}</span>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex flex-col gap-3.5 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 custom-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-500">
                {group.label}
              </span>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? normalizedPath === '' || normalizedPath === '/'
                      : normalizedPath === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#6D001A] text-white font-semibold shadow-burgundy'
                          : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white',
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white',
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.href === '/pipeline' && overdueCount > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-status-danger/20 border border-status-danger/40 px-1.5 py-0.5 text-[9px] font-mono font-bold text-status-danger">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          {overdueCount}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="h-3 w-3 text-white/60 shrink-0" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Info & Sign-Out Deck */}
      <div className="relative border-t border-white/10 pt-3">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B0B0F] p-2.5 shadow-md">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D001A] to-[#8B0022] text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'SS'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">
                {user?.displayName || 'Sanjay Surya'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                <p className="truncate font-mono text-[10px] text-zinc-400">Owner Access</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => void signOut()}
            title="Sign out of Command Center"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-colors hover:border-status-danger/40 hover:bg-status-danger/10 hover:text-status-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
