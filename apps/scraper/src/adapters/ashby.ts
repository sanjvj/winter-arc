// Official Documentation: https://developers.ashbyhq.com/reference/jobboardapilistjobs
// GET https://api.ashbyhq.com/posting-api/job-board/{name}?includeCompensation=true
import { RawJob, SourceConfig } from '../types';

interface AshbyJob {
  id: string;
  title: string;
  publishedAt?: string;
  jobUrl: string;
  location?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  compensation?: {
    compensationTiers?: Array<{
      title?: string;
      tierSummary?: string;
    }>;
  };
}

interface AshbyResponse {
  jobs: AshbyJob[];
}

export async function fetchAshbyJobs(source: SourceConfig): Promise<RawJob[]> {
  const name = source.token || source.company || source.name.toLowerCase();
  const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${name}?includeCompensation=true`;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'WinterArcBot/1.0 (personal job tracker)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Ashby API error for ${source.name} (${response.status}): ${response.statusText}`);
  }

  const data = (await response.json()) as AshbyResponse;
  const jobs: RawJob[] = [];

  for (const item of data.jobs || []) {
    const postedDate = item.publishedAt
      ? item.publishedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    let salaryRaw: string | undefined;
    const tier = item.compensation?.compensationTiers?.[0];
    if (tier?.tierSummary) {
      salaryRaw = tier.tierSummary;
    }

    jobs.push({
      id: `ashby-${name}-${item.id}`,
      title: item.title,
      company: source.name,
      location: item.location || 'Remote',
      url: item.jobUrl,
      source: 'ashby',
      description: item.descriptionPlain || item.descriptionHtml || '',
      postedDate,
      salaryRaw,
    });
  }

  return jobs;
}
