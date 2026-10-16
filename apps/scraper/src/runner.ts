import fs from 'fs';
import path from 'path';
import { SourceConfig, SourceConfigSchema, ScoredJob } from './types';
import { fetchGreenhouseJobs } from './adapters/greenhouse';
import { fetchLeverJobs } from './adapters/lever';
import { fetchAshbyJobs } from './adapters/ashby';
import { fetchSmartRecruitersJobs } from './adapters/smartrecruiters';
import { scoreAndFilterJob } from './filter';

export interface ScraperRunResult {
  ok: boolean;
  totalFetched: number;
  totalKept: number;
  jobs: ScoredJob[];
  perSource: Array<{
    name: string;
    fetched: number;
    kept: number;
    error?: string;
  }>;
}

export function loadSourcesConfig(customPath?: string): SourceConfig[] {
  const configPath = customPath || path.resolve(__dirname, '../config/sources.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Sources config not found at: ${configPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error('Sources config must be a JSON array');
  }
  return raw.map((item) => SourceConfigSchema.parse(item));
}

export async function executeScraper(sources: SourceConfig[]): Promise<ScraperRunResult> {
  const result: ScraperRunResult = {
    ok: true,
    totalFetched: 0,
    totalKept: 0,
    jobs: [],
    perSource: [],
  };

  const enabledSources = sources.filter((s) => s.enabled);
  const allScoredJobs: ScoredJob[] = [];

  for (const source of enabledSources) {
    let sourceFetched = 0;
    let sourceKept = 0;
    let sourceError: string | undefined;

    try {
      let rawJobs = [];
      if (source.type === 'greenhouse') {
        rawJobs = await fetchGreenhouseJobs(source);
      } else if (source.type === 'lever') {
        rawJobs = await fetchLeverJobs(source);
      } else if (source.type === 'ashby') {
        rawJobs = await fetchAshbyJobs(source);
      } else if (source.type === 'smartrecruiters') {
        rawJobs = await fetchSmartRecruitersJobs(source);
      } else {
        throw new Error(`Adapter for ${source.type} not configured`);
      }

      sourceFetched = rawJobs.length;

      for (const raw of rawJobs) {
        const scored = scoreAndFilterJob(raw);
        if (scored) {
          allScoredJobs.push(scored);
          sourceKept++;
        }
      }
    } catch (err) {
      sourceError = (err as Error).message;
    }

    result.perSource.push({
      name: source.name,
      fetched: sourceFetched,
      kept: sourceKept,
      error: sourceError,
    });

    result.totalFetched += sourceFetched;
    result.totalKept += sourceKept;
  }

  // Deduplicate by job ID, keeping the highest score
  const uniqueMap = new Map<string, ScoredJob>();
  for (const job of allScoredJobs) {
    const existing = uniqueMap.get(job.id!);
    if (!existing || job.score > existing.score) {
      uniqueMap.set(job.id!, job);
    }
  }

  // Sort descending by score, limit top 50
  result.jobs = Array.from(uniqueMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return result;
}

export async function ingestJobsToFirestore(uid: string, result: ScraperRunResult): Promise<void> {
  const { db } = await import('./firebase');
  const batch = db.batch();
  const jobsCol = db.collection('users').doc(uid).collection('jobs');

  for (const job of result.jobs) {
    if (!job.id) continue;
    const docRef = jobsCol.doc(job.id);
    batch.set(
      docRef,
      {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        source: job.source,
        salaryRaw: job.salaryRaw || null,
        salaryLPA: job.salaryLPA || null,
        salaryEstimated: job.salaryEstimated || false,
        postedDate: job.postedDate,
        status: job.status || 'new',
        closed: job.closed || false,
        tags: job.tags || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  const runCol = db.collection('users').doc(uid).collection('scraperRuns');
  const runRef = runCol.doc();
  batch.set(runRef, {
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    totalFetched: result.totalFetched,
    totalKept: result.jobs.length,
    perSource: result.perSource,
    ok: result.ok,
  });

  await batch.commit();
}
