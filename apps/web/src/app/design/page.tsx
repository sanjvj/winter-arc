'use client';

import React, { useState } from 'react';
import { BentoGrid, BentoCard, BentoCardState } from '@/components/bento';
import {
  Flame,
  Clock,
  Code2,
  RefreshCw,
  Briefcase,
  Columns3,
  Sparkles,
  TrendingUp,
  Target,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const [interactiveState, setInteractiveState] = useState<BentoCardState>('default');

  return (
    <div className="min-h-screen bg-bg p-6 lg:p-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-token pb-6">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-widest">
            <Sparkles className="h-4 w-4" /> Dev Showcase
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text mt-1">
            Winter Arc Design System & Bento Grid
          </h1>
          <p className="text-sm text-muted mt-1">
            Validating all 7 card dimensions (S, M, W, T, L, XL, H), all 4 lifecycle states, and
            design tokens.
          </p>
        </div>

        {/* Theme Toggle Controls */}
        <div className="flex items-center gap-2 rounded-xl border border-border-token bg-surface p-1.5">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === 'dark' ? 'bg-surface-2 text-accent-ice' : 'text-muted hover:text-text'
            }`}
          >
            <Moon className="h-3.5 w-3.5" /> Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === 'light' ? 'bg-surface-2 text-accent-ice' : 'text-muted hover:text-text'
            }`}
          >
            <Sun className="h-3.5 w-3.5" /> Light
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              theme === 'system' ? 'bg-surface-2 text-accent-ice' : 'text-muted hover:text-text'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" /> System
          </button>
        </div>
      </div>

      {/* State Switcher Bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono uppercase tracking-wider text-muted">
          Test Lifecycle State:
        </span>
        {(['default', 'loading', 'empty', 'error'] as BentoCardState[]).map((st) => (
          <button
            key={st}
            onClick={() => setInteractiveState(st)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-colors ${
              interactiveState === st
                ? 'border-accent-ice bg-accent-ice/10 text-accent-ice'
                : 'border-border-token bg-surface text-muted hover:text-text'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Section 1: All 7 Card Sizes in Bento Grid */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-text">
          1. Standard Bento Grid Dimensions (S, M, W, T, L, XL, H)
        </h2>
        <BentoGrid>
          {/* S (3x1) */}
          <BentoCard
            size="S"
            state={interactiveState}
            icon={<Flame className="h-4 w-4" />}
            title="Size S (3x1)"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-text">14</span>
              <span className="text-xs font-mono text-status-success">Day Streak 🔥</span>
            </div>
          </BentoCard>

          {/* M (4x1) */}
          <BentoCard
            size="M"
            state={interactiveState}
            icon={<Target className="h-4 w-4" />}
            title="Size M (4x1)"
          >
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Daily Floor</span>
                <span className="font-mono text-accent-ice">2 / 2 Problems</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-2">
                <div className="h-2 rounded-full bg-accent-ice w-full" />
              </div>
            </div>
          </BentoCard>

          {/* W (6x1) */}
          <BentoCard
            size="W"
            state={interactiveState}
            icon={<Clock className="h-4 w-4" />}
            title="Size W (6x1 Wide Ribbon)"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">Startup Execution Hours</p>
                <p className="font-display text-2xl font-bold text-text">4.5 / 4.5 hrs</p>
              </div>
              <span className="rounded-full bg-status-success/10 px-3 py-1 text-xs font-semibold text-status-success">
                Target Met
              </span>
            </div>
          </BentoCard>

          {/* H (8x1) */}
          <BentoCard
            size="H"
            state={interactiveState}
            icon={<TrendingUp className="h-4 w-4" />}
            title="Size H (8x1 Hero Horizontal)"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                90-Day Execution Sprint: Week 3 Milestone — Fast-track Dynamic Programming & Graphs.
              </p>
              <span className="font-mono text-xs text-accent-ice">Day 19 of 90</span>
            </div>
          </BentoCard>

          {/* T (3x2) */}
          <BentoCard
            size="T"
            state={interactiveState}
            icon={<RefreshCw className="h-4 w-4" />}
            title="Size T (3x2 Tall)"
          >
            <div className="space-y-3">
              <p className="text-xs text-muted">Due Spaced Revisions</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-surface-2 p-2 text-xs">
                  <p className="font-medium text-text">LRU Cache</p>
                  <p className="text-[10px] text-muted">Step 3 • Overdue 1d</p>
                </div>
                <div className="rounded-lg bg-surface-2 p-2 text-xs">
                  <p className="font-medium text-text">Coin Change</p>
                  <p className="text-[10px] text-muted">Step 1 • Due Today</p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* L (4x2) */}
          <BentoCard
            size="L"
            state={interactiveState}
            icon={<Code2 className="h-4 w-4" />}
            title="Size L (4x2 Large Block)"
          >
            <div className="space-y-3">
              <p className="text-xs text-muted">Pattern Mastery Distribution</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="rounded-lg bg-surface-2 p-2.5">
                  <p className="text-muted text-[10px]">Two Pointers</p>
                  <p className="text-base font-bold text-accent-ice">15 / 15</p>
                </div>
                <div className="rounded-lg bg-surface-2 p-2.5">
                  <p className="text-muted text-[10px]">Sliding Window</p>
                  <p className="text-base font-bold text-accent-ice">12 / 12</p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* XL (8x2) */}
          <BentoCard
            size="XL"
            state={interactiveState}
            icon={<Columns3 className="h-4 w-4" />}
            title="Size XL (8x2 Primary Operational Area)"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">Active Pipeline Distribution</p>
                <span className="font-mono text-xs text-accent-indigo">18 Total Applications</span>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="rounded-xl border border-border-token bg-surface-2 p-3">
                  <span className="text-[10px] uppercase font-mono text-muted">Applied</span>
                  <p className="font-display text-xl font-bold text-text mt-1">8</p>
                </div>
                <div className="rounded-xl border border-border-token bg-surface-2 p-3">
                  <span className="text-[10px] uppercase font-mono text-status-warn">OA Round</span>
                  <p className="font-display text-xl font-bold text-status-warn mt-1">4</p>
                </div>
                <div className="rounded-xl border border-border-token bg-surface-2 p-3">
                  <span className="text-[10px] uppercase font-mono text-accent-ice">Interview</span>
                  <p className="font-display text-xl font-bold text-accent-ice mt-1">2</p>
                </div>
                <div className="rounded-xl border border-border-token bg-surface-2 p-3">
                  <span className="text-[10px] uppercase font-mono text-status-success">Offer</span>
                  <p className="font-display text-xl font-bold text-status-success mt-1">1</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </section>

      {/* Section 2: All 4 Lifecycle States Side-by-Side */}
      <section className="space-y-4 border-t border-border-token pt-8">
        <h2 className="font-display text-xl font-bold text-text">
          2. Mandatory Component Lifecycle States
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Default */}
          <BentoCard
            size="M"
            state="default"
            icon={<Briefcase className="h-4 w-4" />}
            title="Default State"
          >
            <p className="text-sm font-medium text-text">
              Component rendered with healthy active metrics.
            </p>
          </BentoCard>

          {/* Loading Skeleton */}
          <BentoCard
            size="M"
            state="loading"
            icon={<Briefcase className="h-4 w-4" />}
            title="Loading Skeleton"
          />

          {/* Empty State */}
          <BentoCard
            size="M"
            state="empty"
            icon={<Briefcase className="h-4 w-4" />}
            title="Empty State"
            emptyMessage="Zero applications in review. Scraper runs next at 06:00 IST."
            emptyAction={
              <button className="rounded-lg bg-accent-ice/10 px-2 py-1 text-xs font-semibold text-accent-ice hover:bg-accent-ice/20">
                Refresh Feed
              </button>
            }
          />

          {/* Error State */}
          <BentoCard
            size="M"
            state="error"
            icon={<Briefcase className="h-4 w-4" />}
            title="Error State"
            errorMessage="Network timeout reading Firestore index."
            onRetry={() => alert('Retrying fetch...')}
          />
        </div>
      </section>

      {/* Section 3: Semantic Winter Arc Design Tokens */}
      <section className="space-y-4 border-t border-border-token pt-8">
        <h2 className="font-display text-xl font-bold text-text">
          3. Winter Arc Semantic Color Palette
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-11 gap-3">
          <div className="rounded-xl border border-border-token bg-bg p-3 text-center">
            <span className="font-mono text-[10px] text-muted">bg</span>
          </div>
          <div className="rounded-xl border border-border-token bg-surface p-3 text-center">
            <span className="font-mono text-[10px] text-muted">surface</span>
          </div>
          <div className="rounded-xl border border-border-token bg-surface-2 p-3 text-center">
            <span className="font-mono text-[10px] text-muted">surface-2</span>
          </div>
          <div className="rounded-xl border border-border-token p-3 text-center bg-border-token">
            <span className="font-mono text-[10px] text-text">border</span>
          </div>
          <div className="rounded-xl border border-border-token bg-surface p-3 text-center text-text">
            <span className="font-mono text-[10px]">text</span>
          </div>
          <div className="rounded-xl border border-border-token bg-surface p-3 text-center text-muted">
            <span className="font-mono text-[10px]">muted</span>
          </div>
          <div className="rounded-xl border border-border-token bg-accent-ice p-3 text-center text-bg font-bold">
            <span className="font-mono text-[10px]">accent-ice</span>
          </div>
          <div className="rounded-xl border border-border-token bg-accent-indigo p-3 text-center text-bg font-bold">
            <span className="font-mono text-[10px]">accent-indigo</span>
          </div>
          <div className="rounded-xl border border-border-token bg-status-success p-3 text-center text-bg font-bold">
            <span className="font-mono text-[10px]">success</span>
          </div>
          <div className="rounded-xl border border-border-token bg-status-warn p-3 text-center text-bg font-bold">
            <span className="font-mono text-[10px]">warn</span>
          </div>
          <div className="rounded-xl border border-border-token bg-status-danger p-3 text-center text-bg font-bold">
            <span className="font-mono text-[10px]">danger</span>
          </div>
        </div>
      </section>
    </div>
  );
}
