'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Columns3, ArrowRight } from 'lucide-react';
import { Application } from '@winter-arc/shared';

interface PipelineFunnelCardProps {
  applications: Application[];
  loading?: boolean;
}

export function PipelineFunnelCard({
  applications = [],
  loading = false,
}: PipelineFunnelCardProps) {
  if (applications.length === 0 && !loading) {
    return (
      <BentoCard
        size="M"
        state="empty"
        className="order-9 xl:order-none"
        icon={<Columns3 className="h-4 w-4 text-accent-ice" />}
        title="Application Pipeline"
        emptyMessage="Zero active job applications. Begin referral outreach and apply."
        emptyAction={
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline mt-1"
          >
            Open Kanban Pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    );
  }

  const counts = {
    saved: applications.filter((a) => a.status === 'saved').length,
    applied: applications.filter((a) => a.status === 'applied').length,
    oa: applications.filter((a) => a.status === 'oa').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offer: applications.filter((a) => a.status === 'offer').length,
  };

  return (
    <BentoCard
      size="M"
      state={loading ? 'loading' : 'default'}
      className="order-9 xl:order-none"
      icon={<Columns3 className="h-4 w-4 text-accent-ice" />}
      title="Application Funnel"
      action={
        <Link
          href="/pipeline"
          className="text-muted hover:text-accent-ice transition-colors p-1"
          title="Open Kanban Board"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-col justify-between h-full py-1">
        <div className="grid grid-cols-5 gap-1 text-center font-mono">
          <div className="p-1 rounded bg-surface-2 border border-border-token/40">
            <span className="block text-xs font-bold text-text">{counts.saved}</span>
            <span className="text-[9px] text-muted uppercase">Saved</span>
          </div>
          <div className="p-1 rounded bg-accent-ice/10 border border-accent-ice/30">
            <span className="block text-xs font-bold text-accent-ice">{counts.applied}</span>
            <span className="text-[9px] text-accent-ice uppercase">Sent</span>
          </div>
          <div className="p-1 rounded bg-accent-indigo/10 border border-accent-indigo/30">
            <span className="block text-xs font-bold text-accent-indigo">{counts.oa}</span>
            <span className="text-[9px] text-accent-indigo uppercase">OA</span>
          </div>
          <div className="p-1 rounded bg-status-warn/10 border border-status-warn/30">
            <span className="block text-xs font-bold text-status-warn">{counts.interview}</span>
            <span className="text-[9px] text-status-warn uppercase">Rounds</span>
          </div>
          <div className="p-1 rounded bg-status-success/10 border border-status-success/30">
            <span className="block text-xs font-bold text-status-success">{counts.offer}</span>
            <span className="text-[9px] text-status-success uppercase">Offer</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-muted flex items-center justify-between border-t border-border-token/50 pt-1.5 mt-2">
          <span>Total Tracked: {applications.length}</span>
          <span className="text-status-success font-semibold">
            {counts.interview + counts.offer > 0
              ? `${counts.interview + counts.offer} In Late Rounds`
              : 'Outreach Phase'}
          </span>
        </div>
      </div>
    </BentoCard>
  );
}
