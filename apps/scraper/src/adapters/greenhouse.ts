// Official Documentation: https://developers.greenhouse.io/job-board.html
// GET https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
import { RawJob, SourceConfig } from '../types';

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at?: string;
  absolute_url: string;
  location?: {
    name?: string;
  };
  content?: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

export async function fetchGreenhouseJobs(source: SourceConfig): Promise<RawJob[]> {
  const token = source.token || source.id || source.name.toLowerCase();
  const endpoint = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'WinterArcBot/1.0 (personal job tracker)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Greenhouse API error for ${source.name} (${response.status}): ${response.statusText}`);
  }

  const data = (await response.json()) as GreenhouseResponse;
  const jobs: RawJob[] = [];

  for (const item of data.jobs || []) {
    const postedDate = item.updated_at ? item.updated_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
    jobs.push({
      id: `gh-${token}-${item.id}`,
      title: item.title,
      company: source.name,
      location: item.location?.name || 'Remote',
      url: item.absolute_url,
      source: 'greenhouse',
      description: item.content || '',
      postedDate,
    });
  }

  return jobs;
}
