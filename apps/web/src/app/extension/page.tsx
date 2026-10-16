import React from 'react';
import Link from 'next/link';
import { Chrome, Zap, ShieldCheck, Key, ArrowRight } from 'lucide-react';

export default function ExtensionPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border-token pb-5">
        <div className="flex items-center gap-2 text-accent-burgundy-glow font-mono text-xs uppercase tracking-wider">
          <Chrome className="h-4 w-4" /> Manifest V3 Autofill Companion
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-text mt-1">
          Chrome Extension
        </h1>
        <p className="text-sm md:text-base text-muted mt-1">
          Install the optional autofill companion to auto-populate job application forms in 1 click.
        </p>
      </div>

      {/* Do I Need It Card */}
      <div className="rounded-bento border border-border-token bg-surface p-6 space-y-3">
        <h2 className="font-display text-xl font-semibold text-text flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent-burgundy-glow" /> Do I need the extension?
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          <strong className="text-text">No, it is completely optional.</strong> Your Winter Arc Command Center operates 100% standalone for DSA problem tracking, spaced repetition revisions, mock interviews, roadmap milestones, and curated job feeds.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          The Chrome extension is a productivity tool: when you click to apply to an opening on Greenhouse, Lever, Ashby, or Workday, pressing <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-token font-mono text-xs text-text">Alt+Shift+F</kbd> auto-fills your name, contact info, education (CGPA, degree), work experience, notice period, links (GitHub/LinkedIn), and answer bank so you never re-type them.
        </p>
      </div>

      {/* How to Install Guide */}
      <div className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold text-text flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-status-success" /> How to Install the Extension in Chrome
        </h2>

        <ol className="space-y-3 text-sm text-muted list-decimal list-inside leading-relaxed">
          <li>
            <strong className="text-text">Build the extension package:</strong> Run <code className="px-2 py-0.5 rounded bg-surface-2 font-mono text-xs text-text">pnpm --filter @winter-arc/extension build</code> in your terminal.
          </li>
          <li>
            <strong className="text-text">Open Chrome Extensions:</strong> In Google Chrome, navigate to <code className="px-2 py-0.5 rounded bg-surface-2 font-mono text-xs text-text">chrome://extensions</code> in your address bar.
          </li>
          <li>
            <strong className="text-text">Enable Developer Mode:</strong> Toggle the switch in the top-right corner labelled <span className="text-text font-semibold">&ldquo;Developer mode&rdquo;</span>.
          </li>
          <li>
            <strong className="text-text">Click Load unpacked:</strong> Click the <span className="text-text font-semibold">&ldquo;Load unpacked&rdquo;</span> button in the top-left corner.
          </li>
          <li>
            <strong className="text-text">Select the extension folder:</strong> Choose the <code className="px-2 py-0.5 rounded bg-surface-2 font-mono text-xs text-text">apps/extension/dist</code> directory from your local repository.
          </li>
          <li>
            <strong className="text-text">Connect to Dashboard:</strong> Click the extension icon in Chrome toolbar, open Options, enter your Dashboard URL (<code className="px-2 py-0.5 rounded bg-surface-2 font-mono text-xs text-text">https://winter-arc-c2def.web.app</code>) and your API Token.
          </li>
        </ol>

        <div className="pt-2">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-burgundy text-white text-xs font-semibold hover:bg-accent-burgundy-glow transition-all shadow-burgundy"
          >
            <Key className="h-4 w-4" /> Generate Dashboard API Token in Settings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
