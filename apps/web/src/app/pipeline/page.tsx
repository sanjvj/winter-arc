'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useCollection } from '@/lib/data/use-collection';
import {
  Application,
  ApplicationSchema,
  exportApplicationsCsv,
  todayIST,
} from '@winter-arc/shared';
import {
  Columns3,
  Table as TableIcon,
  Plus,
  Download,
  Search,
  Filter,
  UserCheck,
  Zap,
} from 'lucide-react';
import { PipelineKanban } from '@/components/pipeline/pipeline-kanban';
import { ApplicationTable } from '@/components/pipeline/application-table';
import { FollowUpsStrip } from '@/components/pipeline/follow-ups-strip';
import { FunnelHeader } from '@/components/pipeline/funnel-header';
import { ApplicationDrawer } from '@/components/pipeline/application-drawer';
import { QuickAddDrawer } from '@/components/pipeline/quick-add-drawer';
import { toast } from '@/components/ui/toast';

export default function PipelinePage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  const {
    data: applications,
    loading,
    error,
  } = useCollection<Application>('applications', ApplicationSchema);

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [referralOnly, setReferralOnly] = useState(false);

  // Modals & Drawers
  const [isFullDrawerOpen, setIsFullDrawerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  // Keyboard shortcut: Press 'a' to trigger Quick Add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl && ['input', 'textarea', 'select'].includes(activeEl.tagName.toLowerCase());

      if (e.key.toLowerCase() === 'a' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setIsFullDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditingApp(null);
    setIsFullDrawerOpen(true);
  };

  const handleExportCSV = () => {
    if (!applications || applications.length === 0) {
      toast.error('Export Error', 'No applications to export.');
      return;
    }
    const csv = exportApplicationsCsv(applications);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `winter-arc-applications-${todayIST()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications Exported', `${applications.length} applications saved to CSV.`);
  };

  const filteredApplications = useMemo(() => {
    if (!applications) return [];

    return applications.filter((app) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCompany = app.company.toLowerCase().includes(query);
        const matchesRole = app.role.toLowerCase().includes(query);
        const matchesLocation = app.location?.toLowerCase().includes(query) ?? false;
        if (!matchesCompany && !matchesRole && !matchesLocation) return false;
      }

      if (selectedStatus !== 'all' && app.status !== selectedStatus) {
        return false;
      }

      if (selectedSource !== 'all' && app.source !== selectedSource) {
        return false;
      }

      if (referralOnly && !app.referral) {
        return false;
      }

      return true;
    });
  }, [applications, searchTerm, selectedStatus, selectedSource, referralOnly]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-bento bg-surface" />
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-96 w-72 flex-shrink-0 animate-pulse rounded-bento bg-surface"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-bento border border-accent-crimson/30 bg-accent-crimson/10 p-6 text-center text-accent-crimson">
        <p className="font-semibold">Failed to load pipeline applications.</p>
        <p className="text-xs text-muted mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-token pb-5">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <Columns3 className="h-4 w-4" /> Application Funnel
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-text mt-1">
            Pipeline Kanban
          </h1>
          <p className="text-sm text-muted mt-1">
            Track active applications through OA, technical rounds, and offer stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-token bg-surface px-3 py-2 text-xs font-mono text-muted hover:text-text hover:bg-surface-sunken transition-colors"
            title="Export all applications to RFC-4180 CSV"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>

          {/* Quick Add with keyboard badge */}
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-accent-burgundy/40 bg-accent-burgundy/10 px-3.5 py-2 text-xs font-mono text-white hover:bg-accent-burgundy/20 transition-colors"
            title="Quick add application (shortcut: A)"
          >
            <Zap className="h-3.5 w-3.5 text-accent-burgundy-glow" />
            Quick Add
            <kbd className="hidden sm:inline-block rounded bg-surface border border-accent-burgundy/40 px-1 py-0.5 text-[10px] text-white font-mono">
              A
            </kbd>
          </button>

          {/* Full Add */}
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-burgundy px-4 py-2 text-xs font-mono font-semibold text-white hover:bg-accent-burgundy-glow transition-all shadow-burgundy"
          >
            <Plus className="h-4 w-4" /> Add Application
          </button>
        </div>
      </div>

      {/* Follow-ups Strip */}
      {applications && <FollowUpsStrip applications={applications} uid={uid} />}

      {/* Funnel Metrics Bar */}
      {applications && <FunnelHeader applications={applications} />}

      {/* Filter and View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-bento border border-border-token bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company or role..."
              className="w-full rounded-md border border-border-token bg-surface-sunken pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-muted focus:border-accent-ice focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md border border-border-token bg-surface-sunken px-2.5 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="oa">OA</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="ghosted">Ghosted</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="rounded-md border border-border-token bg-surface-sunken px-2.5 py-1.5 text-xs text-text focus:border-accent-ice focus:outline-none font-mono"
          >
            <option value="all">All Sources</option>
            <option value="linkedin">LinkedIn</option>
            <option value="naukri">Naukri</option>
            <option value="instahyre">Instahyre</option>
            <option value="referral">Referral</option>
            <option value="career_page">Career Page</option>
            <option value="other">Other</option>
          </select>

          {/* Referral Only Toggle */}
          <button
            type="button"
            onClick={() => setReferralOnly(!referralOnly)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors ${
              referralOnly
                ? 'bg-accent-mint/15 text-accent-mint border border-accent-mint/30 font-medium'
                : 'bg-surface-sunken text-muted border border-border-token hover:text-text'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" /> Referrals only
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-border-token bg-surface-sunken p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono transition-colors ${
              viewMode === 'kanban'
                ? 'bg-accent-ice text-background font-semibold shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" /> Kanban
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono transition-colors ${
              viewMode === 'table'
                ? 'bg-accent-ice text-background font-semibold shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <PipelineKanban applications={filteredApplications} uid={uid} onEdit={handleEdit} />
      ) : (
        <ApplicationTable applications={filteredApplications} onEdit={handleEdit} />
      )}

      {/* Drawers */}
      <ApplicationDrawer
        isOpen={isFullDrawerOpen}
        onClose={() => setIsFullDrawerOpen(false)}
        uid={uid}
        initialApplication={editingApp}
      />

      <QuickAddDrawer
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        uid={uid}
        existingApplications={applications || []}
      />
    </div>
  );
}
