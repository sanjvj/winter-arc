// Official Documentation: https://github.com/lever/postings-api
// GET https://api.lever.co/v0/postings/{company}?mode=json
import { RawJob, SourceConfig } from '../types';

interface LeverJob {
  id: string;
  text: string;
  createdAt: number;
  hostedUrl: string;
  applyUrl: string;
  categories?: {
    location?: string;
    team?: string;
    commitment?: string;
  };
  descriptionPlain?: string;
  description?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    interval?: string;
  };
}

export async function fetchLeverJobs(source: SourceConfig): Promise<RawJob[]> {
  const company = source.company || source.token || source.name.toLowerCase();
  const endpoint = `https://api.lever.co/v0/postings/${company}?mode=json`;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'WinterArcBot/1.0 (personal job tracker)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Lever API error for ${source.name} (${response.status}): ${response.statusText}`);
  }

  const data = (await response.json()) as LeverJob[];
  const jobs: RawJob[] = [];

  for (const item of Array.isArray(data) ? data : []) {
    const postedDate = item.createdAt
      ? new Date(item.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    let salaryRaw: string | undefined;
    if (item.salaryRange && (item.salaryRange.min || item.salaryRange.max)) {
      salaryRaw = `${item.salaryRange.currency || 'INR'} ${item.salaryRange.min || ''} - ${item.salaryRange.max || ''} (${item.salaryRange.interval || 'yr'})`;
    }

    jobs.push({
      id: `lever-${company}-${item.id}`,
      title: item.text,
      company: source.name,
      location: item.categories?.location || 'Remote',
      url: item.hostedUrl || item.applyUrl,
      source: 'lever',
      description: item.descriptionPlain || item.description || '',
      postedDate,
      salaryRaw,
    });
  }

  return jobs;
}
