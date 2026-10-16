'use client';

import React, { useState, useMemo } from 'react';
import { Briefcase, Search, ExternalLink, Bookmark, Check, X, Building2, MapPin, RefreshCw } from 'lucide-react';
import { Job, JobSchema, todayIST, isIndiaOrRemote } from '@winter-arc/shared';
import { useCollection, updateDocument, addDocument, syncLiveJobsFromBrowser } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/toast';

export default function JobsPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';
  const { data: jobs, loading } = useCollection<Job>('jobs', JobSchema);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'saved' | 'applied' | 'dismissed'>('all');
  const [syncing, setSyncing] = useState(false);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Enforce location filter: only India or Remote
      if (!isIndiaOrRemote(job.location)) {
        return false;
      }
      // 2. Filter by status tab
      if (statusFilter !== 'all' && job.status !== statusFilter) {
        return false;
      }
      // 3. Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesLocation = job.location.toLowerCase().includes(query);
        return matchesTitle || matchesCompany || matchesLocation;
      }
      return true;
    });
  }, [jobs, statusFilter, searchTerm]);

  const handleSaveJob = async (job: Job) => {
    if (!uid || !job.id) return;
    await updateDocument(uid, 'jobs', job.id, { status: 'saved' });
    toast.success('Job Saved', `${job.company} — ${job.title}`);
  };

  const handleDismissJob = async (job: Job) => {
    if (!uid || !job.id) return;
    await updateDocument(uid, 'jobs', job.id, { status: 'dismissed' });
    toast.info('Job Dismissed', `${job.company} — ${job.title}`);
  };

  const handleMarkApplied = async (job: Job) => {
    if (!uid || !job.id) return;
    const today = todayIST();

    // 1. Update job status to applied
    await updateDocument(uid, 'jobs', job.id, { status: 'applied' });

    // 2. Add to applications pipeline
    await addDocument(uid, 'applications', {
      company: job.company,
      role: job.title,
      url: job.url || '',
      source: job.source || 'scraper',
      status: 'applied',
      appliedDate: today,
      referral: false,
      location: job.location || '',
      salaryLPA: job.salaryLPA,
      notes: `Applied from Winter Arc Job Feed on ${today}`,
      jobId: job.id,
      statusHistory: [{ status: 'applied', date: today }],
    });

    toast.success('Application Logged', `Moved ${job.company} — ${job.title} to Applied pipeline`);
  };

  const handleSyncJobs = async () => {
    if (!uid) {
      toast.error('Authentication Required', 'Please sign in to sync scraped jobs');
      return;
    }
    setSyncing(true);
    try {
      const res = await syncLiveJobsFromBrowser(uid);
      toast.success(
        'Job Feed Synced',
        `Fetched ${res.totalFetched} postings across Greenhouse & Lever. Synced ${res.totalSaved} relevant SDE roles!`,
      );
    } catch (err) {
      toast.error('Sync Failed', (err as Error).message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-token">
        <div>
          <div className="flex items-center gap-2 text-accent-burgundy-glow font-mono text-xs uppercase tracking-wider">
            <Briefcase className="h-4 w-4" /> 06:00 IST Scraper Feed • India & Remote Only
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-text mt-1">
            Job Feed
          </h1>
          <p className="text-sm md:text-base text-muted mt-1">
            Curated SDE-1 / fresher openings in India and open Remote roles normalized with LPA salaries.
          </p>
        </div>

        {/* Sync & Search Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSyncJobs}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-burgundy text-white text-xs font-semibold hover:bg-accent-burgundy-glow disabled:opacity-50 transition-all font-mono whitespace-nowrap shadow-burgundy"
            title="Fetch latest tech jobs directly from Greenhouse and Lever"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Scraping...' : 'Sync Live Jobs'}
          </button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search roles or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-2 border border-border-token rounded-lg pl-9 pr-3 py-1.5 text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-accent-ice"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-token pb-3 text-xs overflow-x-auto">
        {(['all', 'new', 'saved', 'applied', 'dismissed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize font-mono text-xs transition-colors ${
              statusFilter === tab
                ? 'bg-accent-burgundy text-white font-semibold shadow-sm'
                : 'bg-surface-2 text-muted hover:text-text border border-border-token'
            }`}
          >
            {tab} ({jobs.filter((j) => (tab === 'all' ? true : j.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Job Cards List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-surface-2 animate-pulse rounded-bento" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-bento border border-border-token bg-surface p-12 text-center text-muted space-y-4">
          <Briefcase className="mx-auto h-8 w-8 text-accent-ice/50 mb-2" />
          <div>
            <p className="text-sm font-semibold text-text">No jobs found in feed</p>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              {jobs.length === 0
                ? 'Sync fresh openings from public ATS boards (Razorpay, Groww, Canonical, InMobi, Slice, Meesho, Paytm).'
                : 'No openings match the selected status or search filter.'}
            </p>
          </div>
          {jobs.length === 0 && (
            <button
              type="button"
              onClick={handleSyncJobs}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-burgundy text-white text-xs font-bold hover:bg-accent-burgundy-glow disabled:opacity-50 transition-all font-display shadow-burgundy"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Scraping Live Boards...' : 'Scrape Live Jobs Now'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-bento border border-border-token bg-surface p-4 flex flex-col justify-between hover:border-border-token/80 transition-all space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-text">{job.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted mt-0.5">
                      <Building2 className="h-3 w-3" />
                      <span>{job.company}</span>
                      {job.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {job.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-accent-ice p-1"
                      title="Open job link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {job.salaryLPA && (
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-status-success/10 text-status-success border border-status-success/30">
                      ₹{job.salaryLPA} LPA
                    </span>
                  )}
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-2 text-muted border border-border-token">
                    {job.status}
                  </span>
                  <span className="text-[10px] font-mono text-muted ml-auto">
                    Posted: {job.postedDate}
                  </span>
                </div>
              </div>

              {/* Actions Strip */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-token">
                {job.status !== 'dismissed' && (
                  <button
                    type="button"
                    onClick={() => handleDismissJob(job)}
                    className="px-2.5 py-1 rounded text-xs text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors flex items-center gap-1 font-mono"
                  >
                    <X className="h-3 w-3" /> Dismiss
                  </button>
                )}

                {job.status !== 'saved' && (
                  <button
                    type="button"
                    onClick={() => handleSaveJob(job)}
                    className="px-2.5 py-1 rounded text-xs text-muted hover:text-text hover:bg-surface-2 transition-colors flex items-center gap-1 font-mono"
                  >
                    <Bookmark className="h-3 w-3" /> Save
                  </button>
                )}

                {job.status !== 'applied' && (
                  <button
                    type="button"
                    onClick={() => handleMarkApplied(job)}
                    className="px-3 py-1 rounded bg-accent-burgundy text-white text-xs font-semibold hover:bg-accent-burgundy-glow transition-all flex items-center gap-1 font-display shadow-sm"
                  >
                    <Check className="h-3 w-3" /> Mark Applied
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
