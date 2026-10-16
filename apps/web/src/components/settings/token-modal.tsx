'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export function TokenModal({ isOpen, onClose, token }: TokenModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success('Token Copied', 'Personal API token copied to clipboard.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Copy Failed', 'Please manually select and copy the token.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-bento border border-border-token bg-surface p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-ice/10 text-accent-ice">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-text">
                Personal API Token Generated
              </h3>
              <p className="text-xs text-muted">
                Use this token to authenticate the Chrome extension.
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

        {/* Warning Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-status-warn/20 bg-status-warn/10 p-3.5 text-xs text-status-warn">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">One-time reveal:</strong> For security, only the
            cryptographic SHA-256 hash is saved in Firestore. Copy and store this token in your
            extension settings now.
          </p>
        </div>

        {/* Token Box */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Raw API Token (32 bytes hex)
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-border-token bg-surface-2 p-3">
            <code className="flex-1 font-mono text-xs text-accent-ice break-all select-all">
              {token}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-text border border-border-token hover:border-accent-ice/50 shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-status-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-accent-ice px-5 py-2 text-xs font-semibold text-bg transition-opacity hover:opacity-90"
          >
            I Have Saved My Token
          </button>
        </div>
      </div>
    </div>
  );
}
