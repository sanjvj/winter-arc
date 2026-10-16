'use client';

import React from 'react';
import Link from 'next/link';
import { BentoCard } from '@/components/bento';
import { Briefcase, ArrowRight, ExternalLink, MapPin } from 'lucide-react';
import { Job } from '@winter-arc/shared';

interface JobPreviewCardProps {
  jobs: Job[];
  loading?: boolean;
}

export function JobPreviewCard({ jobs = [], loading = false }: JobPreviewCardProps) {
  const topJobs = jobs.slice(0, 5);

  if (topJobs.length === 0 && !loading) {
    return (
      <BentoCard
        size="L"
        state="empty"
        className="order-5 xl:order-none"
        icon={<Briefcase className="h-4 w-4 text-accent-ice" />}
        title="Job Feed Preview"
        emptyMessage="No new jobs scraped yet today. The automated scraper runs daily at 06:00 IST."
        emptyAction={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline mt-1"
          >
            Browse all saved openings <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />
    );
  }

  return (
    <BentoCard
      size="L"
      state={loading ? 'loading' : 'default'}
      className="order-5 xl:order-none"
      icon={<Briefcase className="h-4 w-4 text-accent-ice" />}
      title="Fresh Roles Today"
      action={
        <Link
          href="/jobs"
          className="flex items-center gap-1 text-xs font-mono text-accent-ice hover:underline"
        >
          View all ({jobs.length})
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-y-auto space-y-2 pr-1 max-h-[260px] scrollbar-thin">
          {topJobs.map((job, idx) => (
            <div
              key={job.id || idx}
              className="p-2.5 rounded-lg border border-border-token bg-surface hover:bg-surface-2 transition-all space-y-1 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-display text-xs font-bold text-text truncate block">
                    {job.title}
                  </span>
                  <span className="text-[11px] font-mono text-muted block truncate">
                    {job.company}
                  </span>
                </div>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted/60 hover:text-accent-ice p-1 shrink-0"
                    title="Open application link"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-muted pt-1 border-t border-border-token/40">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-2.5 w-2.5" />
                  {job.location || 'Remote'}
                </span>
                {job.salaryLPA && (
                  <span className="font-semibold text-status-success">₹{job.salaryLPA} LPA</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
