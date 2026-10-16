'use client';

import React from 'react';
import { Application, calculatePipelineFunnel } from '@winter-arc/shared';
import { TrendingUp, Users, Clock, Award, Send, FileCode } from 'lucide-react';

interface FunnelHeaderProps {
  applications: Application[];
}

export const FunnelHeader: React.FC<FunnelHeaderProps> = ({ applications }) => {
  const metrics = calculatePipelineFunnel(applications);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Applied */}
      <div className="rounded-bento border border-border-token bg-surface p-3.5">
        <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
          <Send className="h-3.5 w-3.5 text-accent-ice" /> Applied
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold text-text">{metrics.applied}</span>
          <span className="text-[11px] font-mono text-muted">of {metrics.total}</span>
        </div>
      </div>

      {/* OA Rate */}
      <div className="rounded-bento border border-border-token bg-surface p-3.5">
        <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
          <FileCode className="h-3.5 w-3.5 text-status-warn" /> OA Rate
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold text-status-warn">
            {metrics.oaRate}%
          </span>
          <span className="text-[11px] font-mono text-muted">({metrics.oa})</span>
        </div>
      </div>

      {/* Interview Rate */}
      <div className="rounded-bento border border-border-token bg-surface p-3.5">
        <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
          <TrendingUp className="h-3.5 w-3.5 text-accent-ice" /> Interview Rate
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold text-accent-ice">
            {metrics.interviewRate}%
          </span>
          <span className="text-[11px] font-mono text-muted">({metrics.interview})</span>
        </div>
      </div>

      {/* Offer Rate */}
      <div className="rounded-bento border border-border-token bg-surface p-3.5">
        <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
          <Award className="h-3.5 w-3.5 text-status-success" /> Offer Rate
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold text-status-success">
            {metrics.offerRate}%
          </span>
          <span className="text-[11px] font-mono text-muted">({metrics.offer})</span>
        </div>
      </div>

      {/* Avg First Response */}
      <div className="rounded-bento border border-border-token bg-surface p-3.5">
        <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
          <Clock className="h-3.5 w-3.5 text-muted" /> 1st Response
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold text-text">
            {metrics.averageDaysToFirstResponse !== null
              ? `${metrics.averageDaysToFirstResponse}d`
              : '—'}
          </span>
          <span className="text-[11px] font-mono text-muted">avg</span>
        </div>
      </div>

      {/* Referral vs Direct */}
      <div className="rounded-bento border border-border-token bg-surface p-3.5">
        <div className="flex items-center gap-1.5 text-muted text-xs font-mono">
          <Users className="h-3.5 w-3.5 text-status-success" /> Ref vs Direct
        </div>
        <div className="mt-1.5 flex items-baseline gap-1 text-xs font-mono">
          <span className="text-status-success font-semibold">
            {metrics.referralConversion.rate}%
          </span>
          <span className="text-muted/60">vs</span>
          <span className="text-muted">{metrics.nonReferralConversion.rate}%</span>
        </div>
        <div className="text-[10px] text-muted font-mono mt-0.5">
          {metrics.referralConversion.applied} refs / {metrics.nonReferralConversion.applied} direct
        </div>
      </div>
    </div>
  );
};
