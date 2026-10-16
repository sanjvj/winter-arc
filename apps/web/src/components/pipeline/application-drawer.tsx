'use client';

import React, { useState, useEffect } from 'react';
import { Application, ApplicationSchema, ApplicationStatus, todayIST } from '@winter-arc/shared';
import { addDocument, updateDocument, deleteDocument } from '@/lib/data/mutations';
import { X, Building2, Trash2, Calendar, Link as LinkIcon, DollarSign, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface ApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  initialApplication: Application | null;
}

const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: 'Saved', value: 'saved' },
  { label: 'Applied', value: 'applied' },
  { label: 'Online Assessment (OA)', value: 'oa' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offer', value: 'offer' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Ghosted', value: 'ghosted' },
  { label: 'Withdrawn', value: 'withdrawn' },
];

const SOURCE_OPTIONS = [
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Naukri', value: 'naukri' },
  { label: 'Instahyre', value: 'instahyre' },
  { label: 'Referral', value: 'referral' },
  { label: 'Career Page', value: 'career_page' },
  { label: 'Other', value: 'other' },
];

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({
  isOpen,
  onClose,
  uid,
  initialApplication,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('linkedin');
  const [status, setStatus] = useState<ApplicationStatus>('saved');
  const [appliedDate, setAppliedDate] = useState('');
  const [referral, setReferral] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [salaryLPA, setSalaryLPA] = useState<string>('');
  const [location, setLocation] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialApplication) {
      setCompany(initialApplication.company);
      setRole(initialApplication.role);
      setUrl(initialApplication.url || '');
      setSource(initialApplication.source || 'linkedin');
      setStatus(initialApplication.status);
      setAppliedDate(initialApplication.appliedDate || '');
      setReferral(Boolean(initialApplication.referral));
      setReferrerName(initialApplication.referrerName || '');
      setSalaryLPA(
        initialApplication.salaryLPA !== undefined ? String(initialApplication.salaryLPA) : '',
      );
      setLocation(initialApplication.location || '');
      setFollowUpDate(initialApplication.followUpDate || '');
      setNotes(initialApplication.notes || '');
    } else {
      setCompany('');
      setRole('');
      setUrl('');
      setSource('linkedin');
      setStatus('saved');
      setAppliedDate('');
      setReferral(false);
      setReferrerName('');
      setSalaryLPA('');
      setLocation('');
      setFollowUpDate('');
      setNotes('');
    }
  }, [initialApplication, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      toast.error('Validation Error', 'Company and role are required.');
      return;
    }

    setSaving(true);
    const today = todayIST();

    // Invariant: moving/setting to applied auto-sets appliedDate if empty
    let finalAppliedDate = appliedDate.trim();
    if (status === 'applied' && !finalAppliedDate) {
      finalAppliedDate = today;
    }

    const numericSalary = salaryLPA.trim() ? parseFloat(salaryLPA.trim()) : undefined;

    // Build statusHistory
    let statusHistory = initialApplication?.statusHistory
      ? [...initialApplication.statusHistory]
      : [];
    if (!initialApplication) {
      statusHistory = [{ status, date: today }];
    } else if (initialApplication.status !== status) {
      statusHistory.push({ status, date: today });
    }

    const payload: Application = {
      ...(initialApplication?.id ? { id: initialApplication.id } : {}),
      company: company.trim(),
      role: role.trim(),
      url: url.trim(),
      source,
      status,
      appliedDate: finalAppliedDate,
      referral,
      ...(referrerName.trim() ? { referrerName: referrerName.trim() } : {}),
      ...(numericSalary && !isNaN(numericSalary) ? { salaryLPA: numericSalary } : {}),
      location: location.trim(),
      ...(followUpDate.trim() ? { followUpDate: followUpDate.trim() } : {}),
      notes: notes.trim(),
      statusHistory,
    };

    let ok = false;
    if (initialApplication?.id) {
      ok = await updateDocument(
        uid,
        'applications',
        initialApplication.id,
        payload as unknown as Record<string, unknown>,
      );
    } else {
      const newId = await addDocument(uid, 'applications', payload, ApplicationSchema);
      ok = Boolean(newId);
    }

    setSaving(false);
    if (ok) {
      toast.success(
        initialApplication ? 'Application updated' : 'Application created',
        `${company} — ${role}`,
      );
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!initialApplication?.id) return;
    if (window.confirm(`Delete application for ${initialApplication.company}?`)) {
      setSaving(true);
      const ok = await deleteDocument(uid, 'applications', initialApplication.id);
      setSaving(false);
      if (ok) {
        toast.success('Application deleted', initialApplication.company);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-xl flex-col bg-surface-2 border-l border-border-token shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-token px-6 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent-ice" />
            <h2 className="font-display text-lg font-bold text-text">
              {initialApplication ? 'Edit Application' : 'New Application'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5">
                Company *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Swiggy, Stripe, Google"
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
                placeholder="e.g. SDE-1, Software Engineer"
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" /> Job Post URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5">
                Stage / Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as ApplicationStatus;
                  setStatus(newStatus);
                  if (newStatus === 'applied' && !appliedDate) {
                    setAppliedDate(todayIST());
                  }
                }}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Applied Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Salary (LPA)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={salaryLPA}
                onChange={(e) => setSalaryLPA(e.target.value)}
                placeholder="e.g. 18"
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Remote India"
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
              />
            </div>
          </div>

          {/* Referral checkbox and name */}
          <div className="rounded-bento border border-border-token bg-surface p-3.5 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text">
              <input
                type="checkbox"
                checked={referral}
                onChange={(e) => setReferral(e.target.checked)}
                className="h-4 w-4 rounded border-border-token text-status-success focus:ring-status-success"
              />
              Referral Applied
            </label>
            {referral && (
              <div>
                <label className="block text-xs font-mono uppercase text-muted mb-1">
                  Referrer Name / Contact
                </label>
                <input
                  type="text"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  placeholder="e.g. Jane Doe (Alumni @ LinkedIn)"
                  className="w-full rounded-md border border-border-token bg-surface-2 px-3 py-1.5 text-sm text-text focus:border-accent-ice focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Notes & Next Steps
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. HR round cleared, system design with Director on Thursday..."
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
            />
          </div>

          {/* Status History Timeline if editing */}
          {initialApplication?.statusHistory && initialApplication.statusHistory.length > 0 && (
            <div className="border-t border-border-token pt-3">
              <div className="text-xs font-mono uppercase text-muted mb-2">Stage History</div>
              <div className="flex flex-wrap items-center gap-2">
                {initialApplication.statusHistory.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded bg-surface-2 border border-border-token px-2 py-0.5 text-[11px] font-mono text-muted"
                  >
                    <span className="font-semibold text-text uppercase">{h.status}</span>
                    <span className="text-muted/60">({h.date})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border-token">
            {initialApplication?.id ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs font-mono text-status-danger hover:bg-status-danger/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border-token bg-surface px-4 py-2 text-xs font-mono text-muted hover:text-text hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-accent-burgundy px-4 py-2 text-xs font-mono font-semibold text-white hover:bg-accent-burgundy-glow transition-all shadow-burgundy disabled:opacity-50"
              >
                {saving ? 'Saving...' : initialApplication ? 'Update' : 'Add Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
