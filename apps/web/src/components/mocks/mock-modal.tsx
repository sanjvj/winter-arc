'use client';

import React, { useState, useEffect } from 'react';
import { Mock, MockSchema, todayIST } from '@winter-arc/shared';
import { addDocument, updateDocument, deleteDocument } from '@/lib/data/mutations';
import { X, Mic, Trash2, Calendar, Clock, Star, Plus } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface MockModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  initialMock: Mock | null;
}

const TYPE_OPTIONS = [
  { label: 'DSA Problem Solving', value: 'dsa' },
  { label: 'Low-Level Design (LLD)', value: 'lld' },
  { label: 'High-Level System Design', value: 'system-design' },
  { label: 'Behavioral / Leadership', value: 'behavioral' },
  { label: 'Full Loop / Onsite Simulation', value: 'full-loop' },
  { label: 'HR / Culture Fit', value: 'hr' },
] as const;

const PLATFORM_OPTIONS = [
  { label: 'Peer Mock', value: 'peer' },
  { label: 'Paid Platform (e.g. Interviewing.io)', value: 'paid' },
  { label: 'AI Mock', value: 'ai' },
  { label: 'Real Company Interview', value: 'real' },
] as const;

export const MockModal: React.FC<MockModalProps> = ({ isOpen, onClose, uid, initialMock }) => {
  const [date, setDate] = useState(todayIST());
  const [type, setType] = useState<Mock['type']>('dsa');
  const [platform, setPlatform] = useState<Mock['platform']>('peer');
  const [interviewer, setInterviewer] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [score, setScore] = useState<number>(3);
  const [strengthsInput, setStrengthsInput] = useState('');
  const [weaknessesInput, setWeaknessesInput] = useState('');
  const [actionItemInput, setActionItemInput] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [problemTitleInput, setProblemTitleInput] = useState('');
  const [problemTitles, setProblemTitles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialMock) {
      setDate(initialMock.date);
      setType(initialMock.type);
      setPlatform(initialMock.platform);
      setInterviewer(initialMock.interviewer || '');
      setDurationMin(initialMock.durationMin);
      setScore(initialMock.score);
      setStrengthsInput(initialMock.strengths || '');
      setWeaknessesInput(initialMock.weaknesses || '');
      setActionItems(initialMock.actionItems || []);
      setProblemTitles(initialMock.problemTitles || []);
    } else {
      setDate(todayIST());
      setType('dsa');
      setPlatform('peer');
      setInterviewer('');
      setDurationMin(60);
      setScore(3);
      setStrengthsInput('');
      setWeaknessesInput('');
      setActionItems([]);
      setProblemTitles([]);
    }
  }, [initialMock, isOpen]);

  if (!isOpen) return null;

  const handleAddActionItem = () => {
    const trimmed = actionItemInput.trim();
    if (trimmed && !actionItems.includes(trimmed)) {
      setActionItems([...actionItems, trimmed]);
      setActionItemInput('');
    }
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleAddProblemTitle = () => {
    const trimmed = problemTitleInput.trim();
    if (trimmed && !problemTitles.includes(trimmed)) {
      setProblemTitles([...problemTitles, trimmed]);
      setProblemTitleInput('');
    }
  };

  const handleRemoveProblemTitle = (index: number) => {
    setProblemTitles(problemTitles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Mock = {
      ...(initialMock?.id ? { id: initialMock.id } : {}),
      date,
      type,
      platform,
      ...(interviewer.trim() ? { interviewer: interviewer.trim() } : {}),
      durationMin: Math.max(0, durationMin),
      score,
      strengths: strengthsInput.trim(),
      weaknesses: weaknessesInput.trim(),
      actionItems,
      problemTitles,
    };

    let ok = false;
    if (initialMock?.id) {
      ok = await updateDocument(
        uid,
        'mocks',
        initialMock.id,
        payload as unknown as Record<string, unknown>,
      );
    } else {
      const newId = await addDocument(uid, 'mocks', payload, MockSchema);
      ok = Boolean(newId);
    }

    setSaving(false);
    if (ok) {
      toast.success(
        initialMock ? 'Mock updated' : 'Mock logged!',
        `${type.toUpperCase()} interview (${score}/5)`,
      );
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!initialMock?.id) return;
    if (window.confirm('Delete this mock interview log?')) {
      setSaving(true);
      const ok = await deleteDocument(uid, 'mocks', initialMock.id);
      setSaving(false);
      if (ok) {
        toast.success('Mock deleted', 'Record removed.');
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
            <Mic className="h-5 w-5 text-accent-ice" />
            <h2 className="font-display text-lg font-bold text-text">
              {initialMock ? 'Edit Mock Interview' : 'Log Mock Interview'}
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
              <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Duration (min)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                required
                value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5">
                Interview Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Mock['type'])}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted mb-1.5">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Mock['platform'])}
                className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Interviewer Name / Role (Optional)
            </label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="e.g. Peer @ Discord, Senior SDE @ Uber"
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
            />
          </div>

          {/* Score Selector (1-5) */}
          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Performance Score (1 - 5) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setScore(val)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-mono font-semibold transition-colors border ${
                    score === val
                      ? 'bg-accent-ice text-bg border-accent-ice shadow-sm'
                      : 'bg-surface text-muted border-border-token hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${score >= val ? 'fill-current' : ''}`} />
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Problems Covered */}
          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Problems / Scenarios Tackled
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={problemTitleInput}
                onChange={(e) => setProblemTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProblemTitle();
                  }
                }}
                placeholder="e.g. LRU Cache, Rate Limiter"
                className="flex-1 rounded-md border border-border-token bg-surface px-3 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddProblemTitle}
                className="rounded-md border border-border-token bg-surface px-3 py-1.5 text-xs font-mono text-muted hover:text-text"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {problemTitles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {problemTitles.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-surface border border-border-token px-2 py-0.5 text-xs font-mono text-text"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProblemTitle(idx)}
                      className="text-muted hover:text-status-danger"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Strengths (comma-separated or chips) */}
          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Strengths (Key wins, clean code, good communication)
            </label>
            <input
              type="text"
              value={strengthsInput}
              onChange={(e) => setStrengthsInput(e.target.value)}
              placeholder="e.g. Quick complexity analysis, clean modular code, good edge case handling"
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
            />
            <p className="text-[11px] text-muted/60 mt-1">Separate key strengths with commas.</p>
          </div>

          {/* Weaknesses (comma-separated or chips) */}
          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Weaknesses & Gaps (Where you struggled)
            </label>
            <input
              type="text"
              value={weaknessesInput}
              onChange={(e) => setWeaknessesInput(e.target.value)}
              placeholder="e.g. Tree DFS edge cases, missed heap optimization, rushed into coding"
              className="w-full rounded-md border border-border-token bg-surface px-3 py-2 text-sm text-text focus:border-accent-ice focus:outline-none"
            />
            <p className="text-[11px] text-muted/60 mt-1">
              Separate tags with commas. These feed into your weakness frequency analytics.
            </p>
          </div>

          {/* Action Items */}
          <div>
            <label className="block text-xs font-mono uppercase text-muted mb-1.5">
              Action Items (Next Steps to drill)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={actionItemInput}
                onChange={(e) => setActionItemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
                placeholder="e.g. Solve 5 Alien Dictionary topological sort problems"
                className="flex-1 rounded-md border border-border-token bg-surface px-3 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="rounded-md border border-border-token bg-surface px-3 py-1.5 text-xs font-mono text-muted hover:text-text"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {actionItems.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 rounded-md bg-surface border border-border-token px-2.5 py-1.5 text-xs text-text"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-muted hover:text-status-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border-token">
            {initialMock?.id ? (
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
                className="rounded-md bg-accent-ice px-4 py-2 text-xs font-mono font-semibold text-bg hover:bg-accent-ice/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : initialMock ? 'Update Mock' : 'Save Mock'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
