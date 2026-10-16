'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, FileCheck2, CheckCircle2, X, Loader2 } from 'lucide-react';
import {
  analyzeImportData,
  commitImportData,
  ImportDryRunSummary,
  ExportDataPayload,
} from '@/lib/data/export-import';
import { toast } from '@/components/ui/toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  onSuccess?: () => void;
}

export function ImportModal({ isOpen, onClose, uid, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<ImportDryRunSummary | null>(null);
  const [parsedData, setParsedData] = useState<ExportDataPayload | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = analyzeImportData(text);
      setSummary(result.summary);
      setParsedData(result.parsedData);
      if (!result.summary.valid) {
        toast.error('Invalid Backup File', result.summary.error || 'Failed to parse JSON.');
      }
    };
    reader.readAsText(selected);
  };

  const handleApply = async () => {
    if (!parsedData || !uid) return;
    setIsApplying(true);
    try {
      const success = await commitImportData(uid, parsedData);
      if (success) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-bento border border-border-token bg-surface p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-indigo/10 text-accent-indigo">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-text">
                Import Backup & Restore
              </h3>
              <p className="text-xs text-muted">
                Upload a Winter Arc JSON backup file with dry-run inspection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* File Picker */}
        <div className="rounded-xl border border-dashed border-border-token bg-surface-2 p-6 text-center">
          <input
            type="file"
            accept=".json"
            id="import-file-input"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="import-file-input"
            className="flex flex-col items-center cursor-pointer gap-2"
          >
            <FileCheck2 className="h-8 w-8 text-accent-ice/80" />
            <span className="text-xs font-semibold text-text">
              {file ? file.name : 'Select or drop Winter Arc backup JSON'}
            </span>
            <span className="text-[10px] text-muted">
              Accepts .json exports generated from Command Center
            </span>
          </label>
        </div>

        {/* Dry-Run Summary */}
        {summary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-semibold text-text">
                Dry-Run Inspection
              </span>
              {summary.valid ? (
                <span className="flex items-center gap-1 font-mono text-[10px] text-status-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid Schema
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono text-[10px] text-status-danger">
                  <AlertCircle className="h-3.5 w-3.5" /> Invalid Payload
                </span>
              )}
            </div>

            {summary.valid ? (
              <div className="rounded-xl border border-border-token bg-surface-2 p-3 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted">Settings Config: </span>
                    <strong className="text-text">
                      {summary.hasSettings ? 'Included' : 'Missing'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted">12-Week Roadmap: </span>
                    <strong className="text-text">
                      {summary.hasRoadmap ? 'Included' : 'Missing'}
                    </strong>
                  </div>
                </div>

                <div className="border-t border-border-token pt-2 grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div>
                    Problems: <strong className="text-accent-ice">{summary.counts.problems}</strong>
                  </div>
                  <div>
                    Applications:{' '}
                    <strong className="text-accent-ice">{summary.counts.applications}</strong>
                  </div>
                  <div>
                    Daily Logs:{' '}
                    <strong className="text-accent-ice">{summary.counts.dailyLogs}</strong>
                  </div>
                  <div>
                    Mistakes: <strong className="text-accent-ice">{summary.counts.mistakes}</strong>
                  </div>
                  <div>
                    Mocks: <strong className="text-accent-ice">{summary.counts.mocks}</strong>
                  </div>
                  <div>
                    Jobs: <strong className="text-accent-ice">{summary.counts.jobs}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 p-3 text-xs text-status-danger">
                {summary.error}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border-token px-4 py-2 text-xs font-medium text-muted hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!summary?.valid || isApplying}
            className="flex items-center gap-2 rounded-xl bg-accent-ice px-4 py-2 text-xs font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Restoring...
              </>
            ) : (
              'Apply & Restore Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
