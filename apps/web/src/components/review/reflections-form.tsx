'use client';

import React, { useState, useEffect } from 'react';
import { WeeklyReview, WeeklyReviewSchema } from '@winter-arc/shared';
import { setDocument } from '@/lib/data/mutations';
import { PenLine, Check, Save } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface ReflectionsFormProps {
  initialReview: WeeklyReview | null;
  weekStart: string;
  uid: string;
}

export const ReflectionsForm: React.FC<ReflectionsFormProps> = ({
  initialReview,
  weekStart,
  uid,
}) => {
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToChange, setWhatToChange] = useState('');
  const [nextFocus, setNextFocus] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if (initialReview) {
      setWhatWorked(initialReview.whatWorked || '');
      setWhatToChange(initialReview.whatToChange || '');
      setNextFocus(initialReview.nextFocus || '');
    } else {
      setWhatWorked('');
      setWhatToChange('');
      setNextFocus('');
    }
    setLastSaved(null);
  }, [initialReview, weekStart]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!uid) return;

    setSaving(true);
    const payload: WeeklyReview = {
      weekStart,
      whatWorked: whatWorked.trim(),
      whatToChange: whatToChange.trim(),
      nextFocus: nextFocus.trim(),
    };

    const ok = await setDocument(uid, 'weeklyReviews', weekStart, payload, WeeklyReviewSchema);

    setSaving(false);
    if (ok) {
      setLastSaved(new Date().toLocaleTimeString());
      toast.success('Retrospective Saved', `Weekly review for ${weekStart} stored.`);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-bento border border-border-token bg-surface p-5 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border-token pb-3">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-accent-ice" />
          <h3 className="font-display text-base font-bold text-text">
            Weekly Retrospective Reflections
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-status-success">
              <Check className="h-3 w-3" /> Saved at {lastSaved}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-burgundy px-3.5 py-1.5 text-xs font-mono font-semibold text-white hover:bg-accent-burgundy-glow transition-all shadow-burgundy disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save Reflections'}
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div>
          <label className="block text-xs font-mono uppercase text-muted mb-1.5">
            1. What Worked Well? (Tactics, routines, wins to reinforce)
          </label>
          <textarea
            rows={3}
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            placeholder="e.g. Waking up at 06:00 and tackling DSA deep work before phone or Slack worked wonders. Fast solves on trees."
            className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-2 text-xs text-text focus:border-accent-ice focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-muted mb-1.5">
            2. What Needs to Change? (Frictions, distractions, missed targets)
          </label>
          <textarea
            rows={3}
            value={whatToChange}
            onChange={(e) => setWhatToChange(e.target.value)}
            placeholder="e.g. Late startup block dragged past 20:00 twice, delaying dinner and sleep. Need strict 18:15 cutoff."
            className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-2 text-xs text-text focus:border-accent-ice focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-muted mb-1.5">
            3. Single Primary Focus for Next Week
          </label>
          <input
            type="text"
            value={nextFocus}
            onChange={(e) => setNextFocus(e.target.value)}
            placeholder="e.g. 100% floor consistency + 5 referral applications sent before Wednesday"
            className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-2 text-xs text-text focus:border-accent-ice focus:outline-none font-medium"
          />
        </div>
      </div>
    </form>
  );
};
