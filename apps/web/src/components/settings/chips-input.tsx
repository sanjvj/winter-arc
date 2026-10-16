'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface ChipsInputProps {
  label: string;
  description?: string;
  values: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
}

export function ChipsInput({
  label,
  description,
  values,
  onChange,
  placeholder = 'Type and press Enter...',
}: ChipsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addChip = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputValue('');
  };

  const removeChip = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="font-display text-xs font-semibold text-text">{label}</label>
        <span className="font-mono text-[10px] text-muted">{values.length} items</span>
      </div>
      {description && <p className="text-[11px] text-muted leading-tight">{description}</p>}

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border-token bg-surface p-2.5 focus-within:border-accent-ice/50">
        {values.map((chip, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1.5 rounded-lg border border-border-token bg-surface-2 px-2.5 py-1 text-xs font-medium text-text"
          >
            <span>{chip}</span>
            <button
              type="button"
              onClick={() => removeChip(idx)}
              className="text-muted hover:text-status-danger transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <div className="flex items-center flex-1 min-w-[140px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? placeholder : 'Add more...'}
            className="w-full bg-transparent px-2 py-1 text-xs text-text placeholder:text-muted focus:outline-none"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addChip(inputValue)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-ice/10 text-accent-ice hover:bg-accent-ice/20"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
