'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useDoc, setDocument, updateDocument } from '@/lib/data';
import {
  Settings,
  SettingsSchema,
  ScheduleBlock,
  createDefaultSettings,
  getPlanDayNumberIST,
  todayIST,
  validateScheduleBlock,
  moveScheduleBlock,
} from '@winter-arc/shared';
import {
  Copy,
  Check,
  Save,
  Key,
  Shield,
  Clock,
  Target,
  Code2,
  Briefcase,
  Database,
  Download,
  Upload,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sun,
  Moon,
  Laptop,
  X,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ChipsInput } from '@/components/settings/chips-input';
import { TokenModal } from '@/components/settings/token-modal';
import { ImportModal } from '@/components/settings/import-modal';
import { loadDemoData, clearDemoData } from '@/lib/data/demo-data';
import { exportAllUserData } from '@/lib/data/export-import';
import { useTheme } from 'next-themes';

const CATEGORIES = [
  'routine',
  'dsa',
  'rest',
  'study',
  'startup',
  'jobs',
  'gym',
  'mock',
  'log',
  'sleep',
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Load live settings from Firestore
  const { data: remoteSettings, loading } = useDoc<Settings>('settings', 'main', SettingsSchema);

  // Local form state
  const [formData, setFormData] = useState<Settings>(createDefaultSettings(todayIST()));
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Modals state
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Sync remote settings when loaded
  useEffect(() => {
    if (remoteSettings) {
      setFormData(remoteSettings);
    }
  }, [remoteSettings]);

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    await navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    toast.success(
      'UID Copied',
      'Signed-in user UID copied to clipboard (needed for scraper config).',
    );
    setTimeout(() => setCopiedUid(false), 3000);
  };

  const handleSaveSettings = async () => {
    if (!user?.uid) return;

    // Validate entire settings schema
    const validation = SettingsSchema.safeParse(formData);
    if (!validation.success) {
      const err = validation.error.errors[0]?.message || 'Please fix invalid settings inputs';
      toast.error('Validation Error', err);
      return;
    }

    setIsSaving(true);
    const success = await setDocument(user.uid, 'settings', 'main', formData, SettingsSchema);
    setIsSaving(false);

    if (success) {
      toast.success('Settings Saved', 'All system preferences updated in Firestore.');
    }
  };

  // Schedule Block Actions
  const handleAddBlock = () => {
    const newBlock: ScheduleBlock = {
      id: `sb-${Date.now()}`,
      start: '12:00',
      end: '13:00',
      label: 'New Session',
      category: 'study',
    };
    setFormData((prev) => ({
      ...prev,
      scheduleBlocks: [...prev.scheduleBlocks, newBlock],
    }));
  };

  const handleUpdateBlock = (index: number, updates: Partial<ScheduleBlock>) => {
    setFormData((prev) => {
      const cloned = [...prev.scheduleBlocks];
      const target = cloned[index];
      if (target) {
        cloned[index] = { ...target, ...updates };
      }
      return { ...prev, scheduleBlocks: cloned };
    });
  };

  const handleRemoveBlock = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scheduleBlocks: prev.scheduleBlocks.filter((_, idx) => idx !== index),
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => ({
      ...prev,
      scheduleBlocks: moveScheduleBlock(prev.scheduleBlocks, index, direction),
    }));
  };

  // Pattern target updates
  const handleUpdatePattern = (pattern: string, val: number) => {
    setFormData((prev) => ({
      ...prev,
      patternTargets: {
        ...prev.patternTargets,
        [pattern]: Math.max(0, val),
      },
    }));
  };

  const totalPatternSum = Object.values(formData.patternTargets).reduce((a, b) => a + b, 0);

  // Skill Keyword handlers
  const handleAddSkillKeyword = () => {
    setFormData((prev) => ({
      ...prev,
      jobFilters: {
        ...prev.jobFilters,
        skillKeywords: [...prev.jobFilters.skillKeywords, { word: '', weight: 2 }],
      },
    }));
  };

  const handleUpdateSkillKeyword = (index: number, word: string, weight: number) => {
    setFormData((prev) => {
      const cloned = [...prev.jobFilters.skillKeywords];
      cloned[index] = { word, weight };
      return {
        ...prev,
        jobFilters: { ...prev.jobFilters, skillKeywords: cloned },
      };
    });
  };

  const handleRemoveSkillKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      jobFilters: {
        ...prev.jobFilters,
        skillKeywords: prev.jobFilters.skillKeywords.filter((_, i) => i !== index),
      },
    }));
  };

  // API Token Operations
  const handleGenerateToken = async () => {
    if (!user) return;
    setIsTokenLoading(true);
    try {
      let token = '';
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/token', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          token = data.token;
        }
      } catch {
        // Fallback to client-side Web Crypto API
      }

      if (!token) {
        // 32-byte cryptographically secure random token generated in browser
        const randomBytes = new Uint8Array(32);
        window.crypto.getRandomValues(randomBytes);
        token = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');

        // Compute SHA-256 hash using Web Crypto API
        const encoder = new TextEncoder();
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(token));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        // Save SHA-256 hash to Firestore settings/main
        await updateDocument(user.uid, 'settings', 'main', { apiTokenHash: hashHex });
      }

      setGeneratedToken(token);
      setTokenModalOpen(true);
      toast.success('Token Generated', 'Personal API token created and hash saved to Firestore.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Token generation error';
      toast.error('Token Generation Failed', message);
    } finally {
      setIsTokenLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!user) return;
    if (
      !confirm(
        'Are you sure you want to revoke your personal API token? The Chrome extension will lose access until rotated.',
      )
    ) {
      return;
    }
    setIsTokenLoading(true);
    try {
      let revoked = false;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/token', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (res.ok) revoked = true;
      } catch {
        // Fallback to client-side revoke
      }

      if (!revoked) {
        await updateDocument(user.uid, 'settings', 'main', { apiTokenHash: '' });
      }
      toast.success('Token Revoked', 'API token hash removed from Firestore.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Revocation error';
      toast.error('Revocation Failed', message);
    } finally {
      setIsTokenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent-ice" />
      </div>
    );
  }

  const currentPlanDay = getPlanDayNumberIST(formData.planStartDate, todayIST());

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-token pb-5">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ice">
            System Configuration
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
            Command Center Settings
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage execution constraints, daily habit blocks, algorithmic targets, and scraper
            filters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-accent-burgundy px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-accent-burgundy-glow disabled:opacity-50 shrink-0 shadow-burgundy"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </button>
      </div>

      {/* 1. Account Identity & UID */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-accent-ice" />
          <h2 className="font-display text-sm font-bold text-text">Owner Identity & System UID</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border-token bg-surface-2 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-mono text-muted">Owner Email</span>
            <p className="text-xs font-medium text-text">{user?.email}</p>
          </div>

          <div className="rounded-xl border border-border-token bg-surface-2 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-muted">
                Signed-In UID (Scraper & Extension Config)
              </span>
              <button
                onClick={handleCopyUid}
                className="flex items-center gap-1 text-[11px] font-semibold text-accent-ice hover:underline"
              >
                {copiedUid ? (
                  <Check className="h-3 w-3 text-status-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedUid ? 'Copied' : 'Copy UID'}
              </button>
            </div>
            <p className="font-mono text-xs text-text select-all truncate">{user?.uid}</p>
          </div>
        </div>
      </section>

      {/* 2. Plan Duration & Dates */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-accent-indigo" />
          <h2 className="font-display text-sm font-bold text-text">90-Day Execution Plan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text">Plan Start Date (IST)</label>
            <input
              type="date"
              value={formData.planStartDate}
              onChange={(e) => setFormData({ ...formData, planStartDate: e.target.value })}
              className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text">Plan Length (Days)</label>
            <input
              type="number"
              min={1}
              value={formData.planLengthDays}
              onChange={(e) =>
                setFormData({ ...formData, planLengthDays: parseInt(e.target.value, 10) || 90 })
              }
              className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-2 text-xs text-text focus:outline-none focus:border-accent-ice"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="rounded-xl border border-border-token bg-surface-2 px-3 py-2 text-center">
              <span className="text-[10px] text-muted">Sprint Pace</span>
              <p className="font-mono text-xs font-bold text-accent-ice">
                Day {currentPlanDay} of {formData.planLengthDays}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Daily Floor & Target Quotas */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Target className="h-5 w-5 text-status-warn" />
          <h2 className="font-display text-sm font-bold text-text">
            Daily Minimum Floor & Targets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimum Floor */}
          <div className="rounded-xl border border-border-token bg-surface-2 p-4 space-y-3">
            <h3 className="font-display text-xs font-bold text-text uppercase tracking-wider">
              Non-Negotiable Daily Floor
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted block text-[11px] mb-1">DSA Solves Floor</label>
                <input
                  type="number"
                  min={0}
                  value={formData.floor.problems}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: { ...formData.floor, problems: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>

              <div>
                <label className="text-muted block text-[11px] mb-1">Revisions Floor</label>
                <input
                  type="number"
                  min={0}
                  value={formData.floor.revisions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: { ...formData.floor, revisions: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>

              <div>
                <label className="text-muted block text-[11px] mb-1">Applications Floor</label>
                <input
                  type="number"
                  min={0}
                  value={formData.floor.applications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: { ...formData.floor, applications: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-[11px] text-muted">Require Daily Log</span>
                <input
                  type="checkbox"
                  checked={formData.floor.requireLog}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: { ...formData.floor, requireLog: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded accent-accent-ice"
                />
              </div>
            </div>
          </div>

          {/* Daily Targets */}
          <div className="rounded-xl border border-border-token bg-surface-2 p-4 space-y-3">
            <h3 className="font-display text-xs font-bold text-text uppercase tracking-wider">
              Aspirational Targets
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted block text-[11px] mb-1">Target DSA / Day</label>
                <input
                  type="number"
                  min={0}
                  value={formData.targets.problemsPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: {
                        ...formData.targets,
                        problemsPerDay: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>

              <div>
                <label className="text-muted block text-[11px] mb-1">Target Apps / Day</label>
                <input
                  type="number"
                  min={0}
                  value={formData.targets.applicationsPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: {
                        ...formData.targets,
                        applicationsPerDay: parseInt(e.target.value, 10) || 0,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>

              <div>
                <label className="text-muted block text-[11px] mb-1">Startup Target (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={formData.targets.startupHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: {
                        ...formData.targets,
                        startupHours: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>

              <div>
                <label className="text-muted block text-[11px] mb-1">Gym Fitness (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={formData.targets.gymHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targets: { ...formData.targets, gymHours: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full rounded-lg border border-border-token bg-surface px-2.5 py-1.5 font-mono text-xs text-text"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Schedule Blocks Editor */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-accent-ice" />
            <div>
              <h2 className="font-display text-sm font-bold text-text">
                Daily Routine Schedule Blocks
              </h2>
              <p className="text-xs text-muted">
                Blocks used for the rapid daily logging checklist.
              </p>
            </div>
          </div>
          <button
            onClick={handleAddBlock}
            className="flex items-center gap-1.5 rounded-xl border border-border-token bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface"
          >
            <Plus className="h-3.5 w-3.5 text-accent-ice" />
            Add Block
          </button>
        </div>

        <div className="space-y-2">
          {formData.scheduleBlocks.map((block, idx) => {
            const validation = validateScheduleBlock(block);
            return (
              <div
                key={block.id || idx}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border p-2.5 text-xs ${
                  validation.valid
                    ? 'border-border-token bg-surface-2'
                    : 'border-status-danger/40 bg-status-danger/5'
                }`}
              >
                {/* Time Inputs */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="text"
                    value={block.start}
                    placeholder="06:00"
                    onChange={(e) => handleUpdateBlock(idx, { start: e.target.value })}
                    className="w-16 rounded-lg border border-border-token bg-surface px-2 py-1 font-mono text-xs text-text text-center focus:outline-none"
                  />
                  <span className="text-muted">–</span>
                  <input
                    type="text"
                    value={block.end}
                    placeholder="07:00"
                    onChange={(e) => handleUpdateBlock(idx, { end: e.target.value })}
                    className="w-16 rounded-lg border border-border-token bg-surface px-2 py-1 font-mono text-xs text-text text-center focus:outline-none"
                  />
                </div>

                {/* Label Input */}
                <input
                  type="text"
                  value={block.label}
                  placeholder="Activity label..."
                  onChange={(e) => handleUpdateBlock(idx, { label: e.target.value })}
                  className="flex-1 rounded-lg border border-border-token bg-surface px-2.5 py-1 text-xs text-text focus:outline-none"
                />

                {/* Category Dropdown */}
                <select
                  value={block.category}
                  onChange={(e) => handleUpdateBlock(idx, { category: e.target.value })}
                  className="rounded-lg border border-border-token bg-surface px-2 py-1 text-xs text-text capitalize focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Ordering and Delete Actions */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleMoveBlock(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-muted hover:text-text disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveBlock(idx, 'down')}
                    disabled={idx === formData.scheduleBlocks.length - 1}
                    className="p-1 text-muted hover:text-text disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveBlock(idx)}
                    className="p-1 text-muted hover:text-status-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DSA Pattern Targets */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-accent-indigo" />
            <div>
              <h2 className="font-display text-sm font-bold text-text">
                Algorithmic Pattern Targets
              </h2>
              <p className="text-xs text-muted">Target quota across standard interview patterns.</p>
            </div>
          </div>
          <span
            className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
              totalPatternSum === 168
                ? 'border-status-success/30 bg-status-success/10 text-status-success'
                : 'border-status-warn/30 bg-status-warn/10 text-status-warn'
            }`}
          >
            Sum: {totalPatternSum} / 168 Target
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(formData.patternTargets).map(([pattern, count]) => (
            <div
              key={pattern}
              className="rounded-xl border border-border-token bg-surface-2 p-2.5 space-y-1"
            >
              <span className="text-[10px] text-muted block truncate" title={pattern}>
                {pattern}
              </span>
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) => handleUpdatePattern(pattern, parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-border-token bg-surface px-2 py-1 font-mono text-xs font-bold text-accent-ice text-center"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Scraper Job Filters */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-5 w-5 text-accent-ice" />
          <h2 className="font-display text-sm font-bold text-text">
            Job Scraper Filters & Match Weights
          </h2>
        </div>

        <ChipsInput
          label="Include Title Keywords"
          description="Roles containing these terms will be ingested into your job feed."
          values={formData.jobFilters.includeTitleKeywords}
          onChange={(newVal) =>
            setFormData({
              ...formData,
              jobFilters: { ...formData.jobFilters, includeTitleKeywords: newVal },
            })
          }
        />

        <ChipsInput
          label="Exclude Title Keywords"
          description="Immediate discard list for senior roles, management, or irrelevant tech."
          values={formData.jobFilters.excludeTitleKeywords}
          onChange={(newVal) =>
            setFormData({
              ...formData,
              jobFilters: { ...formData.jobFilters, excludeTitleKeywords: newVal },
            })
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChipsInput
            label="Target Locations"
            values={formData.jobFilters.locations}
            onChange={(newVal) =>
              setFormData({
                ...formData,
                jobFilters: { ...formData.jobFilters, locations: newVal },
              })
            }
          />

          <ChipsInput
            label="Preferred Hubs"
            values={formData.jobFilters.preferredLocations}
            onChange={(newVal) =>
              setFormData({
                ...formData,
                jobFilters: { ...formData.jobFilters, preferredLocations: newVal },
              })
            }
          />
        </div>

        {/* Numeric and boolean toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-[11px] text-muted">Max Experience (Years)</label>
            <input
              type="number"
              min={0}
              value={formData.jobFilters.maxMinExperienceYears}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobFilters: {
                    ...formData.jobFilters,
                    maxMinExperienceYears: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-2 text-xs font-mono text-text"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-muted">Min Salary (LPA)</label>
            <input
              type="number"
              min={0}
              value={formData.jobFilters.minSalaryLPA}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobFilters: {
                    ...formData.jobFilters,
                    minSalaryLPA: parseInt(e.target.value, 10) || 0,
                  },
                })
              }
              className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-2 text-xs font-mono text-text"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-muted">Max Job Age (Days)</label>
            <input
              type="number"
              min={1}
              value={formData.jobFilters.maxAgeDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobFilters: {
                    ...formData.jobFilters,
                    maxAgeDays: parseInt(e.target.value, 10) || 1,
                  },
                })
              }
              className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-2 text-xs font-mono text-text"
            />
          </div>
        </div>

        {/* Checkbox Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border-token pt-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.jobFilters.allowRemoteIndia}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobFilters: { ...formData.jobFilters, allowRemoteIndia: e.target.checked },
                })
              }
              className="h-4 w-4 rounded accent-accent-ice"
            />
            <span className="text-text">Allow Remote (India)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.jobFilters.includeUnknownSalary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobFilters: { ...formData.jobFilters, includeUnknownSalary: e.target.checked },
                })
              }
              className="h-4 w-4 rounded accent-accent-ice"
            />
            <span className="text-text">Include Unknown Salary</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.jobFilters.includeInternships}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobFilters: { ...formData.jobFilters, includeInternships: e.target.checked },
                })
              }
              className="h-4 w-4 rounded accent-accent-ice"
            />
            <span className="text-text">Include Internships</span>
          </label>
        </div>

        {/* Skill Keywords with Weights */}
        <div className="border-t border-border-token pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xs font-bold text-text">Skill Keywords Ranking</h3>
              <p className="text-[11px] text-muted">
                Assign higher weights (1-3) to rank relevant roles first.
              </p>
            </div>
            <button
              onClick={handleAddSkillKeyword}
              className="flex items-center gap-1 text-xs font-semibold text-accent-ice hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {formData.jobFilters.skillKeywords.map((skill, sIdx) => (
              <div
                key={sIdx}
                className="flex items-center gap-2 rounded-xl border border-border-token bg-surface-2 p-2 text-xs"
              >
                <input
                  type="text"
                  value={skill.word}
                  placeholder="e.g. react"
                  onChange={(e) => handleUpdateSkillKeyword(sIdx, e.target.value, skill.weight)}
                  className="flex-1 bg-surface rounded-lg px-2 py-1 text-xs text-text border border-border-token"
                />
                <select
                  value={skill.weight}
                  onChange={(e) =>
                    handleUpdateSkillKeyword(sIdx, skill.word, parseInt(e.target.value, 10) || 1)
                  }
                  className="bg-surface rounded-lg px-2 py-1 text-xs text-accent-ice border border-border-token font-mono font-semibold"
                >
                  <option value={1}>w: 1</option>
                  <option value={2}>w: 2</option>
                  <option value={3}>w: 3</option>
                </select>
                <button
                  onClick={() => handleRemoveSkillKeyword(sIdx)}
                  className="text-muted hover:text-status-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FX Rates */}
        <div className="border-t border-border-token pt-4 space-y-2">
          <h3 className="font-display text-xs font-bold text-text">Currency FX Rates (to INR)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted block mb-1">USD Rate</label>
              <input
                type="number"
                value={formData.jobFilters.fxRates.USD}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobFilters: {
                      ...formData.jobFilters,
                      fxRates: {
                        ...formData.jobFilters.fxRates,
                        USD: parseFloat(e.target.value) || 85,
                      },
                    },
                  })
                }
                className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-1.5 font-mono text-xs text-text"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted block mb-1">EUR Rate</label>
              <input
                type="number"
                value={formData.jobFilters.fxRates.EUR}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobFilters: {
                      ...formData.jobFilters,
                      fxRates: {
                        ...formData.jobFilters.fxRates,
                        EUR: parseFloat(e.target.value) || 95,
                      },
                    },
                  })
                }
                className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-1.5 font-mono text-xs text-text"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted block mb-1">GBP Rate</label>
              <input
                type="number"
                value={formData.jobFilters.fxRates.GBP}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jobFilters: {
                      ...formData.jobFilters,
                      fxRates: {
                        ...formData.jobFilters.fxRates,
                        GBP: parseFloat(e.target.value) || 110,
                      },
                    },
                  })
                }
                className="w-full rounded-xl border border-border-token bg-surface-2 px-3 py-1.5 font-mono text-xs text-text"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Theme Preference */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-3">
        <h2 className="font-display text-sm font-bold text-text">Theme Appearance</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
              theme === 'dark'
                ? 'border-accent-ice bg-accent-ice/10 text-accent-ice'
                : 'border-border-token bg-surface-2 text-muted hover:text-text'
            }`}
          >
            <Moon className="h-4 w-4" /> Dark Theme (Default)
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
              theme === 'light'
                ? 'border-accent-ice bg-accent-ice/10 text-accent-ice'
                : 'border-border-token bg-surface-2 text-muted hover:text-text'
            }`}
          >
            <Sun className="h-4 w-4" /> Calibrated Light
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
              theme === 'system'
                ? 'border-accent-ice bg-accent-ice/10 text-accent-ice'
                : 'border-border-token bg-surface-2 text-muted hover:text-text'
            }`}
          >
            <Laptop className="h-4 w-4" /> System Preference
          </button>
        </div>
      </section>

      {/* 8. API Token Management */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-accent-ice" />
            <div>
              <h2 className="font-display text-sm font-bold text-text">
                Chrome Extension API Token
              </h2>
              <p className="text-xs text-muted">Secured via SHA-256 hash storage in Firestore.</p>
            </div>
          </div>

          <span
            className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
              formData.apiTokenHash
                ? 'border-status-success/30 bg-status-success/10 text-status-success'
                : 'border-status-warn/30 bg-status-warn/10 text-status-warn'
            }`}
          >
            {formData.apiTokenHash ? 'Token Active' : 'No Token Configured'}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleGenerateToken}
            disabled={isTokenLoading}
            className="flex items-center gap-2 rounded-xl bg-accent-burgundy px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-burgundy-glow disabled:opacity-50 shadow-burgundy"
          >
            {isTokenLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Key className="h-3.5 w-3.5" />
            )}
            {formData.apiTokenHash ? 'Rotate API Token' : 'Generate API Token'}
          </button>

          {formData.apiTokenHash && (
            <button
              onClick={handleRevokeToken}
              disabled={isTokenLoading}
              className="flex items-center gap-2 rounded-xl border border-status-danger/30 bg-status-danger/10 px-4 py-2 text-xs font-semibold text-status-danger hover:bg-status-danger/20 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Revoke Token
            </button>
          )}
        </div>
      </section>

      {/* 9. Data Backup & Demo Data Management */}
      <section className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-accent-indigo" />
          <div>
            <h2 className="font-display text-sm font-bold text-text">
              Data Portability & Demo Isolation
            </h2>
            <p className="text-xs text-muted">
              Adheres strictly to Rule 9: Demo data exists only behind explicit triggers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Backup / Export / Import */}
          <div className="rounded-xl border border-border-token bg-surface-2 p-4 space-y-3">
            <h3 className="font-display text-xs font-bold text-text">Data Portability</h3>
            <p className="text-[11px] text-muted">
              Download complete JSON backup or restore collections with dry-run verification.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => user?.uid && exportAllUserData(user.uid)}
                className="flex items-center gap-1.5 rounded-lg border border-border-token bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-2"
              >
                <Download className="h-3.5 w-3.5 text-accent-ice" />
                Export JSON
              </button>

              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border-token bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-2"
              >
                <Upload className="h-3.5 w-3.5 text-accent-indigo" />
                Import JSON
              </button>
            </div>
          </div>

          {/* Demo Data Controls */}
          <div className="rounded-xl border border-border-token bg-surface-2 p-4 space-y-3">
            <h3 className="font-display text-xs font-bold text-text">Demo Fixture Management</h3>
            <p className="text-[11px] text-muted">
              Populate test applications and problems, or wipe all transactional mock records.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => user?.uid && loadDemoData(user.uid)}
                className="rounded-lg border border-border-token bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:border-accent-ice/40"
              >
                Load Demo Data
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear all demo and transactional records? This cannot be undone.')) {
                    if (user?.uid) void clearDemoData(user.uid);
                  }
                }}
                className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-1.5 text-xs font-semibold text-status-danger hover:bg-status-danger/20"
              >
                Clear Demo Data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <TokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        token={generatedToken}
      />

      {user?.uid && (
        <ImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          uid={user.uid}
        />
      )}
    </div>
  );
}
