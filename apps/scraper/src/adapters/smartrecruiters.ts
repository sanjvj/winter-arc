// Official Documentation: https://developers.smartrecruiters.com/reference/postings-api
// GET https://api.smartrecruiters.com/v1/companies/{id}/postings
import { RawJob, SourceConfig } from '../types';

interface SmartRecruitersPosting {
  id: string;
  name: string;
  releasedDate?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  refNumber?: string;
  compensation?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

interface SmartRecruitersResponse {
  content: SmartRecruitersPosting[];
}

export async function fetchSmartRecruitersJobs(source: SourceConfig): Promise<RawJob[]> {
  const companyId = source.id || source.token || source.name.toLowerCase();
  const endpoint = `https://api.smartrecruiters.com/v1/companies/${companyId}/postings`;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'WinterArcBot/1.0 (personal job tracker)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SmartRecruiters API error for ${source.name} (${response.status}): ${response.statusText}`);
  }

  const data = (await response.json()) as SmartRecruitersResponse;
  const jobs: RawJob[] = [];

  for (const item of data.content || []) {
    const postedDate = item.releasedDate
      ? item.releasedDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const locParts = [item.location?.city, item.location?.country].filter(Boolean);
    const location = locParts.length ? locParts.join(', ') : 'Remote';

    let salaryRaw: string | undefined;
    if (item.compensation?.min || item.compensation?.max) {
      salaryRaw = `${item.compensation.currency || 'INR'} ${item.compensation.min || ''} - ${item.compensation.max || ''}`;
    }

    jobs.push({
      id: `sr-${companyId}-${item.id}`,
      title: item.name,
      company: source.name,
      location,
      url: `https://jobs.smartrecruiters.com/${companyId}/${item.id}`,
      source: 'smartrecruiters',
      description: '',
      postedDate,
      salaryRaw,
    });
  }

  return jobs;
}
