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
          The Chrome extension is a productivity tool: when you open a job application on <strong className="text-text">LinkedIn (Easy Apply)</strong>, <strong className="text-text">Wellfound</strong>, or <strong className="text-text">any company career portal</strong> (Greenhouse, Lever, Ashby, Workday, etc.), click the extension or press <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-token font-mono text-xs text-text">Alt+Shift+F</kbd> to automatically populate your name, email, phone, education, experience, notice period, portfolio links, and answers in 1 click.
        </p>
        <div className="p-3 rounded-lg bg-surface-2 border border-border-token text-xs text-muted flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-status-success shrink-0" />
          <span><strong className="text-text">Safety Guarantee:</strong> The extension only fills detected inputs. It will <strong className="text-text">never auto-submit</strong> your application, giving you 100% control to review before applying.</span>
        </div>
      </div>

      {/* How to Install Guide */}
      <div className="rounded-bento border border-border-token bg-surface p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold text-text flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-status-success" /> How to Setup in Chrome (Takes 30 Seconds)
        </h2>

        <ol className="space-y-3 text-sm text-muted list-decimal list-inside leading-relaxed">
          <li>
            <strong className="text-text">Open Chrome Extensions:</strong> In Google Chrome, go to <code className="px-2 py-0.5 rounded bg-surface-2 font-mono text-xs text-text">chrome://extensions</code> in your address bar.
          </li>
          <li>
            <strong className="text-text">Enable Developer Mode:</strong> Toggle the switch in the top-right corner labelled <span className="text-text font-semibold">&ldquo;Developer mode&rdquo;</span>.
          </li>
          <li>
            <strong className="text-text">Click Load Unpacked:</strong> Click the <span className="text-text font-semibold">&ldquo;Load unpacked&rdquo;</span> button in the top-left corner.
          </li>
          <li>
            <strong className="text-text">Select Extension Folder:</strong> Select the directory:
            <div className="mt-1 p-2 rounded bg-surface-2 font-mono text-xs text-text border border-border-token select-all">
              /home/sanjay/Desktop/apps/extension/dist
            </div>
          </li>
          <li>
            <strong className="text-text">Pin & Use:</strong> Pin the Winter Arc extension icon in your Chrome toolbar. When viewing any job application on LinkedIn, Wellfound, or career portals, click the icon and hit <strong className="text-text">&ldquo;⚡ Autofill This Page&rdquo;</strong> (or press <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border-token font-mono text-xs text-text">Alt+Shift+F</kbd>).
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
