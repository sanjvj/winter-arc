'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Edit3, Eye, Check, Clock, Save, FileText } from 'lucide-react';
import { STANDARD_PATTERNS, PatternNoteSchema } from '@winter-arc/shared';
import { useAuth } from '@/contexts/auth-context';
import { useCollection, setDocument } from '@/lib/data';

const DEFAULT_TEMPLATE = (pattern: string) => `# Pattern: ${pattern}

## Trigger Signs
- What problem statement characteristics signal this pattern?
- Key keywords or invariants (e.g., sorted arrays, contiguous subarrays, monotonic conditions).

## Template Code
\`\`\`python
def solve(nums):
    # 1. Initialize pointers / auxiliary structures
    # 2. Main loop / invariant maintenance
    # 3. Return target result
    pass
\`\`\`

## Common Traps & Edge Cases
- Off-by-one boundary checks.
- Empty inputs or single-element collections.
- Duplicates, negative numbers, integer overflow.
`;

/**
 * Clean, zero-dependency Markdown renderer supporting:
 * - Headings (#, ##, ###)
 * - Fenced code blocks with copy/syntax styling
 * - Bullet lists
 * - Inline formatting (bold, inline code)
 */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Fenced Code Block handling
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        renderedElements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-lg overflow-hidden border border-border-token bg-bg"
          >
            {codeLang && (
              <div className="px-3 py-1 bg-surface-2 border-b border-border-token text-[11px] font-mono text-muted uppercase">
                {codeLang}
              </div>
            )}
            <pre className="p-3 text-xs font-mono text-accent-ice overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>,
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, '');
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1
          key={i}
          className="font-display text-xl font-bold text-text mt-4 mb-2 pb-1 border-b border-border-token"
        >
          {line.replace(/^# /, '')}
        </h1>,
      );
    } else if (line.startsWith('## ')) {
      renderedElements.push(
        <h2
          key={i}
          className="font-display text-base font-bold text-accent-ice mt-4 mb-1.5 flex items-center gap-1.5"
        >
          {line.replace(/^## /, '')}
        </h2>,
      );
    } else if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={i} className="font-display text-sm font-semibold text-text mt-3 mb-1">
          {line.replace(/^### /, '')}
        </h3>,
      );
    }
    // Bullet points
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().replace(/^[-*]\s+/, '');
      renderedElements.push(
        <li key={i} className="text-xs text-muted leading-relaxed ml-4 list-disc my-0.5">
          {formatInline(bulletText)}
        </li>,
      );
    }
    // Empty lines
    else if (!line.trim()) {
      renderedElements.push(<div key={i} className="h-2" />);
    }
    // Standard paragraph
    else {
      renderedElements.push(
        <p key={i} className="text-xs text-muted leading-relaxed my-1">
          {formatInline(line)}
        </p>,
      );
    }
  }

  return <div className="space-y-0.5 font-sans">{renderedElements}</div>;
}

function formatInline(text: string): React.ReactNode {
  // Simple bold and code formatter
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 rounded bg-surface-2 text-accent-ice font-mono text-[11px] border border-border-token"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function PatternCheatSheets() {
  const { user } = useAuth();
  const [selectedPattern, setSelectedPattern] = useState<string>(STANDARD_PATTERNS[0]);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [content, setContent] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Fetch all saved pattern notes
  const { data: notes } = useCollection('patternNotes', PatternNoteSchema);

  // When selectedPattern or notes change, load corresponding note
  useEffect(() => {
    const existing = notes.find((n) => n.pattern === selectedPattern);
    if (existing && existing.markdown) {
      setContent(existing.markdown);
    } else {
      setContent(DEFAULT_TEMPLATE(selectedPattern));
    }
    setSavingStatus('saved');
  }, [selectedPattern, notes]);

  // Debounced autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveContent = useCallback(
    async (text: string) => {
      if (!user?.uid) return;
      setSavingStatus('saving');

      const ok = await setDocument(
        user.uid,
        'patternNotes',
        selectedPattern,
        {
          pattern: selectedPattern,
          markdown: text,
        },
        PatternNoteSchema,
      );

      if (ok) {
        setSavingStatus('saved');
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        );
      } else {
        setSavingStatus('dirty');
      }
    },
    [user, selectedPattern],
  );

  const handleContentChange = (newText: string) => {
    setContent(newText);
    setSavingStatus('dirty');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveContent(newText);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[600px]">
      {/* Left Patterns Navigation List */}
      <div className="md:col-span-3 rounded-bento border border-border-token bg-surface p-3 flex flex-col justify-between">
        <div>
          <div className="px-2 py-2 border-b border-border-token mb-2 flex items-center gap-1.5 text-xs font-mono uppercase text-muted tracking-wider">
            <BookOpen className="h-4 w-4 text-accent-ice" /> 18 Standard Patterns
          </div>

          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {STANDARD_PATTERNS.map((pattern) => {
              const isSelected = selectedPattern === pattern;
              const hasCustomNote = notes.some(
                (n) => n.pattern === pattern && n.markdown.length > 0,
              );

              return (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => setSelectedPattern(pattern)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-accent-burgundy text-white font-semibold shadow-sm'
                      : 'text-muted hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <span className="truncate">{pattern}</span>
                  {hasCustomNote && !isSelected && (
                    <FileText className="h-3 w-3 text-accent-ice/70 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-2 border-t border-border-token text-[11px] text-muted">
          Auto-saves to cloud on edit.
        </div>
      </div>

      {/* Right Editor & Preview Pane */}
      <div className="md:col-span-9 rounded-bento border border-border-token bg-surface p-5 flex flex-col justify-between">
        <div>
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-token gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-muted">Cheat Sheet Note</span>
              <h2 className="font-display text-lg font-bold text-text">{selectedPattern}</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Save Indicator */}
              <div className="text-[11px] font-mono flex items-center gap-1.5 mr-2">
                {savingStatus === 'saving' ? (
                  <span className="text-status-warn flex items-center gap-1">
                    <Clock className="h-3 w-3 animate-spin" /> Saving...
                  </span>
                ) : savingStatus === 'saved' ? (
                  <span className="text-status-success flex items-center gap-1">
                    <Check className="h-3 w-3" /> Saved {lastSavedTime ? `at ${lastSavedTime}` : ''}
                  </span>
                ) : (
                  <span className="text-muted">Unsaved edits...</span>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-border-token bg-surface-2 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'edit'
                      ? 'bg-surface text-text shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`hidden lg:flex px-2.5 py-1 rounded font-medium transition-colors items-center gap-1 ${
                    viewMode === 'split'
                      ? 'bg-surface text-text shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'preview'
                      ? 'bg-surface text-text shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>

              <button
                type="button"
                onClick={() => saveContent(content)}
                className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text border border-border-token text-xs font-medium flex items-center gap-1"
                title="Force Save"
              >
                <Save className="h-3.5 w-3.5" /> Save
              </button>
            </div>
          </div>

          {/* Editor & Preview Area */}
          <div className="py-4">
            {viewMode === 'edit' && (
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={22}
                className="w-full bg-surface-2 border border-border-token rounded-lg p-4 font-mono text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice resize-none leading-relaxed"
                placeholder="Write pattern notes in markdown..."
              />
            )}

            {viewMode === 'preview' && (
              <div className="p-4 rounded-lg bg-surface-2 border border-border-token min-h-[460px] overflow-y-auto">
                <MarkdownRenderer content={content} />
              </div>
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={22}
                  className="w-full bg-surface-2 border border-border-token rounded-lg p-3 font-mono text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice resize-none leading-relaxed"
                  placeholder="Write pattern notes in markdown..."
                />
                <div className="p-3 rounded-lg bg-surface-2 border border-border-token max-h-[475px] overflow-y-auto">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
