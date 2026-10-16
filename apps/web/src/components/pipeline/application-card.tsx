'use client';

import React from 'react';
import { Application, diffDaysIST, todayIST } from '@winter-arc/shared';
import { Calendar, Building2, UserCheck, AlertCircle, ExternalLink } from 'lucide-react';

interface ApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  isDragging?: boolean;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onEdit,
  isDragging,
}) => {
  const today = todayIST();
  const hasAppliedDate = Boolean(application.appliedDate);
  const daysSinceApplied = hasAppliedDate ? diffDaysIST(application.appliedDate, today) : null;

  const isTerminal = ['rejected', 'withdrawn', 'offer'].includes(application.status);
  const isFollowUpOverdue =
    !isTerminal &&
    Boolean(application.followUpDate) &&
    (application.followUpDate as string) <= today;

  return (
    <div
      onClick={() => onEdit(application)}
      className={`group relative rounded-bento border border-border-token bg-surface p-3.5 transition-all duration-150 hover:border-accent-ice/40 hover:bg-surface-2 cursor-pointer shadow-sm ${
        isDragging ? 'opacity-40 ring-2 ring-accent-ice/50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-text font-medium text-sm truncate">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted" />
            <span className="truncate">{application.company}</span>
            {application.url && (
              <a
                href={application.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted hover:text-accent-ice transition-colors ml-0.5"
                title="Open job link"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="text-xs text-muted truncate mt-0.5 font-mono">{application.role}</div>
        </div>

        {application.referral && (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono uppercase font-semibold bg-status-success/15 text-status-success border border-status-success/30 flex-shrink-0">
            <UserCheck className="h-2.5 w-2.5" /> Ref
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
        <span className="rounded bg-surface-2 border border-border-token px-1.5 py-0.5 text-muted">
          {application.source || 'direct'}
        </span>

        {application.salaryLPA && (
          <span className="rounded bg-accent-ice/10 border border-accent-ice/20 px-1.5 py-0.5 text-accent-ice">
            {application.salaryLPA} LPA
          </span>
        )}

        {daysSinceApplied !== null && (
          <span className="text-muted/70 ml-auto">
            {daysSinceApplied === 0 ? 'Applied today' : `${daysSinceApplied}d ago`}
          </span>
        )}
      </div>

      {application.followUpDate && !isTerminal && (
        <div
          className={`mt-2.5 flex items-center gap-1 rounded px-2 py-1 text-[11px] font-mono ${
            isFollowUpOverdue
              ? 'bg-status-danger/15 text-status-danger border border-status-danger/30'
              : 'bg-surface-2 text-muted border border-border-token'
          }`}
        >
          {isFollowUpOverdue ? (
            <AlertCircle className="h-3 w-3 flex-shrink-0 text-status-danger" />
          ) : (
            <Calendar className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="truncate">
            Follow-up: {application.followUpDate}
            {isFollowUpOverdue ? ' (Overdue)' : ''}
          </span>
        </div>
      )}
    </div>
  );
};
