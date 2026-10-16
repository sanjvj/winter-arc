'use client';

import React, { useState, useMemo } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { parseProblemsCsv, CsvParseResult, Problem, ProblemSchema } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { addDocument } from '@/lib/data';
import { toast } from '@/components/ui/toast';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProblems: Problem[];
  onImportComplete?: () => void;
}

export function CsvModal({ isOpen, onClose, existingProblems, onImportComplete }: CsvModalProps) {
  const { user } = useAuth();
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  // Set of existing URLs for duplicate detection
  const existingUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const p of existingProblems) {
      if (p.url) {
        urls.add(p.url.toLowerCase().replace(/\/$/, ''));
      }
    }
    return urls;
  }, [existingProblems]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const res = parseProblemsCsv(text, existingUrls);
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (!text.trim()) {
      setParseResult(null);
      return;
    }
    const res = parseProblemsCsv(text, existingUrls);
    setParseResult(res);
  };

  const handleCommit = async () => {
    if (!user?.uid || !parseResult || parseResult.valid.length === 0) return;

    setImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const problem of parseResult.valid) {
      const docId = await addDocument(user.uid, 'problems', problem, ProblemSchema);
      if (docId) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setImporting(false);
    toast.success(
      'Import Complete',
      `Imported ${successCount} problems successfully.${failCount > 0 ? ` (${failCount} failed)` : ''}`,
    );

    onImportComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface border border-border-token rounded-bento p-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-token">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-accent-ice font-mono border border-border-token">
                <Upload className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-text">Import Problems (CSV)</h2>
                <p className="text-xs text-muted">
                  Supports Notion / spreadsheet exports with columns: title, url, pattern,
                  difficulty, date, outcome
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload and Paste Section */}
          <div className="py-4 space-y-4">
            {/* File dropzone / picker */}
            <div className="border-2 border-dashed border-border-token hover:border-accent-ice/50 rounded-xl p-5 text-center transition-colors">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <FileText className="h-8 w-8 text-accent-ice/70" />
                <span className="text-xs font-semibold text-text">
                  {fileName ? fileName : 'Choose CSV file or drag and drop here'}
                </span>
                <span className="text-[11px] text-muted">
                  Comma-delimited .csv exported from Notion or Sheets
                </span>
              </label>
            </div>

            {/* Paste alternative */}
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Or paste CSV text directly:
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`title,url,pattern,difficulty,date,outcome\n"Two Sum","https://leetcode.com/problems/two-sum/","Arrays & Hashing","easy","2026-10-10","clean"`}
                className="w-full bg-surface-2 border border-border-token rounded-lg p-3 text-xs font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent-ice resize-none"
              />
            </div>

            {/* Dry Run Preview Summary */}
            {parseResult && (
              <div className="space-y-3 pt-2">
                <h4 className="font-display text-xs font-bold text-text uppercase tracking-wider">
                  Dry-Run Verification Summary
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-muted block">Valid Records</span>
                      <span className="font-display text-lg font-bold text-status-success">
                        {parseResult.valid.length}
                      </span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-status-success" />
                  </div>

                  <div className="p-3 rounded-lg bg-status-warn/10 border border-status-warn/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-muted block">Duplicates Skipped</span>
                      <span className="font-display text-lg font-bold text-status-warn">
                        {parseResult.duplicates.length}
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-status-warn" />
                  </div>

                  <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-muted block">Invalid Rows</span>
                      <span className="font-display text-lg font-bold text-status-danger">
                        {parseResult.errors.length}
                      </span>
                    </div>
                    <AlertCircle className="h-5 w-5 text-status-danger" />
                  </div>
                </div>

                {/* Duplicates list */}
                {parseResult.duplicates.length > 0 && (
                  <div className="p-3 rounded-lg bg-surface-2 border border-border-token max-h-24 overflow-y-auto text-xs space-y-1">
                    <span className="text-status-warn font-semibold block text-[11px]">
                      Skipped Duplicates (URL already logged):
                    </span>
                    {parseResult.duplicates.map((d, i) => (
                      <div key={i} className="text-muted flex justify-between">
                        <span className="truncate">{d.title}</span>
                        <span className="font-mono text-[10px] text-muted/60">
                          Row {d.rowNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Errors list */}
                {parseResult.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/30 max-h-28 overflow-y-auto text-xs space-y-1">
                    <span className="text-status-danger font-semibold block text-[11px]">
                      Errors Encountered:
                    </span>
                    {parseResult.errors.map((e, i) => (
                      <div key={i} className="text-status-danger text-[11px]">
                        Row {e.rowNumber}: {e.error}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sample valid preview table */}
                {parseResult.valid.length > 0 && (
                  <div className="rounded-lg border border-border-token bg-surface overflow-hidden">
                    <div className="p-2 bg-surface-2 border-b border-border-token text-[11px] font-mono text-muted uppercase">
                      Preview First {Math.min(5, parseResult.valid.length)} Records
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-border-token">
                          {parseResult.valid.slice(0, 5).map((p, i) => (
                            <tr key={i} className="p-2">
                              <td className="p-2 font-medium text-text">{p.title}</td>
                              <td className="p-2 text-muted">{p.pattern}</td>
                              <td className="p-2 capitalize text-muted">{p.difficulty}</td>
                              <td className="p-2 font-mono text-[11px] text-muted">{p.solvedAt}</td>
                              <td className="p-2 font-mono text-accent-ice text-[11px]">
                                Step {p.revision.step}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border-token flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-muted hover:text-text hover:bg-surface-2 border border-border-token transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={importing || !parseResult || parseResult.valid.length === 0}
            className="px-5 py-2 rounded-lg text-xs font-medium bg-accent-burgundy text-white hover:bg-accent-burgundy-glow font-display flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-burgundy"
          >
            {importing ? (
              <span>Importing...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Commit Import ({parseResult ? parseResult.valid.length : 0} Problems)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
