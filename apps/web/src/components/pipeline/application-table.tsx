'use client';

import React from 'react';
import { Application, diffDaysIST, todayIST } from '@winter-arc/shared';
import { Building2, ExternalLink, Calendar, Edit3, UserCheck, AlertCircle } from 'lucide-react';

interface ApplicationTableProps {
  applications: Application[];
  onEdit: (app: Application) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications, onEdit }) => {
  const today = todayIST();

  if (applications.length === 0) {
    return (
      <div className="rounded-bento border border-border-token bg-surface p-12 text-center text-muted">
        <Building2 className="mx-auto h-8 w-8 text-accent-ice/60 mb-3" />
        <p className="text-sm font-medium">No applications match your filter criteria.</p>
        <p className="text-xs text-muted/60 mt-1">Try clearing filters or add a new application.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-bento border border-border-token bg-surface">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-token bg-surface-2 text-[11px] font-mono uppercase text-muted">
            <th className="py-3 px-4">Company & Role</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Source</th>
            <th className="py-3 px-4">Applied</th>
            <th className="py-3 px-4">Follow-up</th>
            <th className="py-3 px-4">Salary</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-token font-mono text-xs">
          {applications.map((app) => {
            const daysSince = app.appliedDate ? diffDaysIST(app.appliedDate, today) : null;
            const isTerminal = ['rejected', 'withdrawn', 'offer'].includes(app.status);
            const isFollowUpOverdue =
              !isTerminal && Boolean(app.followUpDate) && (app.followUpDate as string) <= today;

            return (
              <tr
                key={app.id || `${app.company}-${app.role}`}
                className="hover:bg-surface-2/60 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 font-sans font-medium text-text text-sm">
                    <span>{app.company}</span>
                    {app.url && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-accent-ice transition-colors"
                        title="Open job link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {app.referral && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-status-success/15 text-status-success border border-status-success/30">
                        <UserCheck className="h-2.5 w-2.5" /> Ref
                      </span>
                    )}
                  </div>
                  <div className="text-muted text-[11px] font-mono mt-0.5 truncate max-w-xs">
                    {app.role}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span className="rounded bg-surface-2 border border-border-token px-2 py-0.5 text-[11px] uppercase text-text font-semibold">
                    {app.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-muted">{app.source || 'direct'}</td>

                <td className="py-3 px-4 text-muted">
                  {app.appliedDate ? (
                    <div>
                      <div>{app.appliedDate}</div>
                      <div className="text-[10px] text-muted/60">
                        {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                      </div>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="py-3 px-4">
                  {app.followUpDate ? (
                    <div
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                        isFollowUpOverdue
                          ? 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                          : 'bg-surface-2 text-muted'
                      }`}
                    >
                      {isFollowUpOverdue && (
                        <AlertCircle className="h-3 w-3 text-status-danger flex-shrink-0" />
                      )}
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      {app.followUpDate}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>

                <td className="py-3 px-4 text-muted">
                  {app.salaryLPA ? `${app.salaryLPA} LPA` : '—'}
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(app)}
                    className="inline-flex items-center gap-1 rounded bg-surface-2 border border-border-token px-2.5 py-1 text-xs text-muted hover:text-text hover:bg-surface transition-colors"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
