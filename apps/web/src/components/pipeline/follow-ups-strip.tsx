'use client';

import React from 'react';
import { Application, getOverdueFollowUps, todayIST, addDaysIST } from '@winter-arc/shared';
import { updateDocument } from '@/lib/data/mutations';
import { BellRing, Check, Clock3, CalendarPlus } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface FollowUpsStripProps {
  applications: Application[];
  uid: string;
}

export const FollowUpsStrip: React.FC<FollowUpsStripProps> = ({ applications, uid }) => {
  const today = todayIST();
  const overdueApps = getOverdueFollowUps(applications, today);

  if (overdueApps.length === 0) {
    return null;
  }

  const handleClearFollowUp = async (appId: string | undefined, company: string) => {
    if (!appId) return;
    const ok = await updateDocument(uid, 'applications', appId, {
      followUpDate: '',
    });
    if (ok) {
      toast.success('Follow-up cleared', `Marked follow-up for ${company} as completed.`);
    }
  };

  const handleSnooze = async (appId: string | undefined, company: string, days: number) => {
    if (!appId) return;
    const nextDate = addDaysIST(today, days);
    const ok = await updateDocument(uid, 'applications', appId, {
      followUpDate: nextDate,
    });
    if (ok) {
      toast.success('Rescheduled', `Follow-up for ${company} postponed to ${nextDate}.`);
    }
  };

  return (
    <div className="rounded-bento border border-status-warn/30 bg-status-warn/10 p-4">
      <div className="flex items-center gap-2 text-status-warn font-mono text-xs uppercase font-semibold">
        <BellRing className="h-4 w-4" />
        Follow-ups Due ({overdueApps.length})
      </div>
      <p className="text-xs text-muted mt-0.5">
        Action needed on these active applications to keep momentum.
      </p>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {overdueApps.map((app) => (
          <div
            key={app.id || `${app.company}-${app.role}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border-token bg-surface p-2.5 text-xs shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-text truncate">{app.company}</div>
              <div className="text-muted truncate font-mono text-[11px]">{app.role}</div>
              <div className="text-status-danger font-mono text-[10px] mt-0.5 flex items-center gap-1">
                <Clock3 className="h-3 w-3" /> Due {app.followUpDate}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleClearFollowUp(app.id, app.company)}
                className="inline-flex items-center gap-1 rounded bg-status-success/15 px-2 py-1 text-[11px] font-mono text-status-success border border-status-success/30 hover:bg-status-success/25 transition-colors"
                title="Mark follow-up done"
              >
                <Check className="h-3 w-3" /> Done
              </button>
              <button
                type="button"
                onClick={() => handleSnooze(app.id, app.company, 3)}
                className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-1 text-[11px] font-mono text-muted border border-border-token hover:text-text hover:bg-surface transition-colors"
                title="Postpone 3 days"
              >
                <CalendarPlus className="h-3 w-3" /> +3d
              </button>
              <button
                type="button"
                onClick={() => handleSnooze(app.id, app.company, 7)}
                className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-1 text-[11px] font-mono text-muted border border-border-token hover:text-text hover:bg-surface transition-colors"
                title="Postpone 7 days"
              >
                +7d
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
