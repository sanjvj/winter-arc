'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Bot, CheckCircle2, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { ScraperRun } from '@winter-arc/shared';

interface ScraperHealthCardProps {
  runs: ScraperRun[];
  loading?: boolean;
}

export function ScraperHealthCard({ runs = [], loading = false }: ScraperHealthCardProps) {
  const latestRun = runs.length > 0 ? runs[0] : null;

  if (!latestRun && !loading) {
    return (
      <BentoCard
        size="W"
        state="empty"
        className="order-16 xl:order-none"
        icon={<Bot className="h-4 w-4 text-accent-ice" />}
        title="Scraper Engine Status"
        emptyMessage="Scraper scheduler ready. Scheduled to trigger via GitHub Actions daily at 06:00 IST."
        emptyAction={
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted mt-1">
            <Clock className="h-3 w-3 text-accent-ice" />
            Next scheduled run: Tomorrow 06:00 IST
          </div>
        }
      />
    );
  }

  const isOk = Boolean(latestRun?.ok);

  return (
    <BentoCard
      size="W"
      state={loading ? 'loading' : 'default'}
      className="order-16 xl:order-none"
      icon={<Bot className="h-4 w-4 text-accent-ice" />}
      title="Scraper Engine Status"
      action={
        <div className="flex items-center gap-1.5">
          {isOk ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-success bg-status-success/10 border border-status-success/30 px-2 py-0.5 rounded-full font-bold">
              <CheckCircle2 className="h-3 w-3" /> Operational
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-status-danger bg-status-danger/10 border border-status-danger/30 px-2 py-0.5 rounded-full font-bold">
              <AlertTriangle className="h-3 w-3" /> Warnings
            </span>
          )}
        </div>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-display text-2xl font-bold text-text">
              +{latestRun?.totalNew ?? 0}
            </span>
            <span className="font-mono text-xs text-muted ml-1.5">New Roles Ingested Last Run</span>
          </div>

          <span className="text-[10px] font-mono text-muted">Cron: 06:00 IST Daily</span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-muted border-t border-border-token/50 pt-1.5 mt-2">
          <span>Sources Active: {latestRun?.perSource?.length || 4} Portals</span>
          <Link href="/jobs" className="flex items-center gap-1 text-accent-ice hover:underline">
            Review Ingested Feed <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </BentoCard>
  );
}
