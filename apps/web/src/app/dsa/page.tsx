'use client';

import React, { useState, useEffect } from 'react';
import { Code2, Plus, Download, Upload, BarChart3, BookOpen, Layers } from 'lucide-react';
import {
  Problem,
  ProblemSchema,
  SettingsSchema,
  exportProblemsCsv,
  todayIST,
} from '@winter-arc/shared';
import { useCollection, useDoc } from '@/lib/data';
import { ProblemTable } from '@/components/dsa/problem-table';
import { AddProblemDrawer } from '@/components/dsa/add-problem-drawer';
import { ProblemDetailModal } from '@/components/dsa/problem-detail-modal';
import { PatternCoverageSection } from '@/components/dsa/pattern-coverage-section';
import { PatternCheatSheets } from '@/components/dsa/pattern-cheat-sheets';
import { CsvModal } from '@/components/dsa/csv-modal';
import { toast } from '@/components/ui/toast';

export default function DsaPage() {
  const [activeTab, setActiveTab] = useState<'problems' | 'coverage' | 'cheatsheets'>('problems');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Load problems and settings from Firestore
  const { data: problems, loading: problemsLoading } = useCollection('problems', ProblemSchema);
  const { data: settings } = useDoc('settings', 'main', SettingsSchema);

  // Global shortcut 'n' to open Add Problem drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsAddDrawerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CSV Export
  const handleExportCsv = () => {
    if (problems.length === 0) {
      toast.info('No Problems to Export', 'Log or import some problems first.');
      return;
    }

    const csvContent = exportProblemsCsv(problems);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `winter-arc-problems-${todayIST()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Exported', `Downloaded ${problems.length} problems.`);
  };

  const patternTargets = settings?.patternTargets ?? {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-token">
        <div>
          <div className="flex items-center gap-2 text-accent-ice font-mono text-xs uppercase tracking-wider">
            <Code2 className="h-4 w-4" /> Algorithmic Problem Tracker
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text mt-1">
            DSA & Patterns
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Rapid logging, pattern distribution, cheat sheets, and spaced repetition tracking.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg border border-border-token bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-muted" /> Export CSV
          </button>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-border-token bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Import Notion or Spreadsheet CSV"
          >
            <Upload className="h-3.5 w-3.5 text-muted" /> Import CSV
          </button>

          <button
            type="button"
            onClick={() => setIsAddDrawerOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-accent-ice text-black text-xs font-display font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity"
            title="Add Problem (shortcut 'n')"
          >
            <Plus className="h-4 w-4" /> Add Problem{' '}
            <kbd className="hidden sm:inline font-mono text-[10px] px-1 bg-black/15 rounded">n</kbd>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border-token space-x-6 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('problems')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'problems'
              ? 'border-accent-ice text-accent-ice font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Layers className="h-4 w-4" /> Problems Tracker ({problems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coverage')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'coverage'
              ? 'border-accent-ice text-accent-ice font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Pattern Coverage
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cheatsheets')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'cheatsheets'
              ? 'border-accent-ice text-accent-ice font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Pattern Cheat Sheets
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'problems' && (
        <ProblemTable
          problems={problems}
          loading={problemsLoading}
          onOpenAddDrawer={() => setIsAddDrawerOpen(true)}
          onSelectProblem={(p) => setSelectedProblem(p)}
        />
      )}

      {activeTab === 'coverage' && (
        <PatternCoverageSection
          problems={problems}
          patternTargets={patternTargets}
          onSelectPatternFilter={() => {
            setActiveTab('problems');
          }}
        />
      )}

      {activeTab === 'cheatsheets' && <PatternCheatSheets />}

      {/* Add Problem Drawer */}
      <AddProblemDrawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} />

      {/* Problem Detail Modal */}
      <ProblemDetailModal problem={selectedProblem} onClose={() => setSelectedProblem(null)} />

      {/* CSV Import Modal */}
      <CsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        existingProblems={problems}
      />
    </div>
  );
}
