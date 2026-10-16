'use client';

import React, { useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentDerived: number;
  currentOverride: number | undefined;
  onSaveOverride: (value: number | undefined) => void;
}

export function OverrideModal({
  isOpen,
  onClose,
  title,
  currentDerived,
  currentOverride,
  onSaveOverride,
}: OverrideModalProps) {
  const [overrideValue, setOverrideValue] = useState<string>(
    currentOverride !== undefined ? currentOverride.toString() : currentDerived.toString(),
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const val = parseInt(overrideValue, 10);
    if (!isNaN(val) && val >= 0) {
      onSaveOverride(val);
    }
    onClose();
  };

  const handleReset = () => {
    onSaveOverride(undefined); // Revert to auto-derived
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border-token rounded-bento p-5 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-border-token">
          <h3 className="font-display text-sm font-bold text-text">Manual Override: {title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted">
          Auto-derived count from records is{' '}
          <span className="font-mono font-bold text-accent-ice">{currentDerived}</span>. You can
          override this count manually for today&apos;s log.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-mono font-medium text-text">Override Count</label>
          <input
            type="number"
            min={0}
            max={999}
            value={overrideValue}
            onChange={(e) => setOverrideValue(e.target.value)}
            className="w-full bg-surface-2 border border-border-token rounded-lg px-3 py-2 text-sm font-mono text-text focus:outline-none focus:border-accent-ice"
            placeholder={currentDerived.toString()}
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-token">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-token text-xs font-mono text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Auto
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border-token text-xs font-mono text-muted hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-ice text-background font-mono text-xs font-bold hover:bg-accent-ice/90 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Save Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
