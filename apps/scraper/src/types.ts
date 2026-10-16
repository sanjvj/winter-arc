import { z } from 'zod';
import { Job } from '@winter-arc/shared';

export const SourceConfigSchema = z.object({
  type: z.enum(['greenhouse', 'lever', 'ashby', 'smartrecruiters', 'adzuna', 'rss', 'custom_html']),
  name: z.string(),
  token: z.string().optional(),
  company: z.string().optional(),
  id: z.string().optional(),
  url: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type SourceConfig = z.infer<typeof SourceConfigSchema>;

export interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description: string;
  postedDate: string;
  salaryRaw?: string;
}

export interface ScoredJob extends Job {
  score: number;
}
