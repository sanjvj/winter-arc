'use client';

import React, { useState, useEffect } from 'react';
import { Application, ApplicationSchema, todayIST } from '@winter-arc/shared';
import { addDocument } from '@/lib/data/mutations';
import { X, Zap, AlertTriangle, LinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface QuickAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  existingApplications: Application[];
}

export const QuickAddDrawer: React.FC<QuickAddDrawerProps> = ({
  isOpen,
  onClose,
  uid,
  existingApplications,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [referral, setReferral] = useState(false);
  const [status, setStatus] = useState<'applied' | 'saved'>('applied');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCompany('');
      setRole('');
      setUrl('');
      setReferral(false);
      setStatus('applied');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Duplicate detection
  const trimmedCompany = company.trim().toLowerCase();
  const trimmedRole = role.trim().toLowerCase();
  const duplicate = existingApplications.find(
    (a) =>
      trimmedCompany &&
      trimmedRole &&
      a.company.trim().toLowerCase() === trimmedCompany &&
      a.role.trim().toLowerCase() === trimmedRole,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      toast.error('Validation Error', 'Company and role are required.');
      return;
    }

    setSaving(true);
    const today = todayIST();

    const payload: Application = {
      company: company.trim(),
      role: role.trim(),
      url: url.trim(),
      source: referral ? 'referral' : 'career_page',
      status,
      appliedDate: status === 'applied' ? today : '',
      referral,
      location: '',
      notes: '',
      statusHistory: [{ status, date: today }],
    };

    const newId = await addDocument(uid, 'applications', payload, ApplicationSchema);
    setSaving(false);

    if (newId) {
      toast.success(
        status === 'applied' ? 'Application logged!' : 'Job saved!',
        `${company} — ${role}`,
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-md flex-col bg-surface-2 border-l border-border-token shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-token px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent-ice" />
            <div>
              <h2 className="font-display text-base font-bold text-text">Quick Apply</h2>
              <p className="text-[11px] font-mono text-muted">Shortcut [A]</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {duplicate && (
            <div className="rounded-bento border border-status-warn/40 bg-status-warn/10 p-3 flex items-start gap-2.5 text-xs text-status-warn">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Duplicate warning:</span> An application for{' '}
                <span className="font-semibold text-text">{duplicate.company}</span> -{' '}
                <span className="font-semibold text-text">{duplicate.role}</span> already exists
                with status <span className="uppercase font-mono">{duplicate.status}</span>.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">Company *</label>
            <input
              type="text"
              required
              autoFocus
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Swiggy, Cred, Google"
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">Role *</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. SDE-1, Backend Engineer"
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" /> Job URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-mono uppercase text-muted">Status</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('applied')}
                className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
                  status === 'applied'
                    ? 'bg-accent-burgundy text-white font-semibold shadow-sm'
                    : 'bg-surface text-muted hover:text-text border border-border-token'
                }`}
              >
                Applied (Today)
              </button>
              <button
                type="button"
                onClick={() => setStatus('saved')}
                className={`rounded px-3 py-1.5 text-xs font-mono transition-colors ${
                  status === 'saved'
                    ? 'bg-accent-burgundy text-white font-semibold shadow-sm'
                    : 'bg-surface text-muted hover:text-text border border-border-token'
                }`}
              >
                Saved
              </button>
            </div>
          </div>

          <div className="rounded-bento border border-border-token bg-surface p-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text">
              <input
                type="checkbox"
                checked={referral}
                onChange={(e) => setReferral(e.target.checked)}
                className="h-4 w-4 rounded border-border-token text-status-success focus:ring-status-success"
              />
              Referral Applied
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border-token">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border-token bg-surface px-4 py-2 text-xs font-mono text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-accent-burgundy px-4 py-2 text-xs font-mono font-semibold text-white hover:bg-accent-burgundy-glow transition-all shadow-burgundy disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
