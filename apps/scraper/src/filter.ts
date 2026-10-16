import crypto from 'crypto';
import { RawJob, ScoredJob } from './types';

const BLACKLIST_KEYWORDS = [
  'senior',
  'sr.',
  'sr ',
  'lead',
  'staff',
  'principal',
  'director',
  'vp',
  'vice president',
  'manager',
  'head of',
  'architect',
  'chief',
  'fellow',
  'sales',
  'recruiter',
  'accountant',
  'talent',
  'legal',
  'counsel',
  'receptionist',
  'customer service',
];

const TARGET_TECH_KEYWORDS = [
  'software',
  'engineer',
  'developer',
  'sde',
  'frontend',
  'front-end',
  'backend',
  'back-end',
  'fullstack',
  'full-stack',
  'mts',
  'member of technical staff',
  'graduate',
  'associate',
  'intern',
  'systems',
  'platform',
  'devops',
  'infrastructure',
  'data engineer',
  'qa',
  'automation',
];

const KNOWN_SKILLS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'Spring Boot',
  'Go',
  'Golang',
  'C++',
  'Rust',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'GraphQL',
  'REST',
];

export function generateJobId(company: string, title: string, url: string): string {
  const norm = `${company.toLowerCase().trim()}:${title.toLowerCase().trim()}:${url.trim()}`;
  return crypto.createHash('sha256').update(norm).digest('hex').slice(0, 20);
}

export function parseSalaryLPA(raw?: string): { salaryLPA?: number; salaryEstimated: boolean } {
  if (!raw) return { salaryEstimated: false };

  // Match Indian Lakhs (e.g. 15-20 LPA, 18L, 18 LPA)
  const lpaMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:lpa|lac|lakh|l)/i);
  if (lpaMatch && lpaMatch[1]) {
    const minVal = parseFloat(lpaMatch[1]);
    const maxVal = lpaMatch[2] ? parseFloat(lpaMatch[2]) : minVal;
    const val = (minVal + maxVal) / 2;
    return { salaryLPA: Math.round(val * 10) / 10, salaryEstimated: false };
  }

  // Match USD annual salary (e.g. $80,000 - $120,000)
  const usdMatch = raw.match(/\$\s*(\d{2,3}),?(\d{3})\b/);
  if (usdMatch) {
    const usd = parseInt(`${usdMatch[1]}${usdMatch[2]}`, 10);
    // Convert to INR Lakhs at ~84 INR/USD
    const lpa = (usd * 84) / 100000;
    return { salaryLPA: Math.round(lpa * 10) / 10, salaryEstimated: true };
  }

  return { salaryEstimated: false };
}

export function extractTags(title: string, description: string): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  for (const skill of KNOWN_SKILLS) {
    const lowerSkill = skill.toLowerCase();
    if (combined.includes(lowerSkill)) {
      tags.push(skill);
    }
  }

  return tags.slice(0, 5);
}

export function scoreAndFilterJob(raw: RawJob, maxDaysOld = 30): ScoredJob | null {
  const lowerTitle = raw.title.toLowerCase();

  // 1. Hard discard on blacklisted / senior keywords
  for (const kw of BLACKLIST_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lowerTitle)) {
      return null;
    }
  }

  // 2. Must match at least one engineering / target keyword
  let hasTargetKw = false;
  let titleScore = 0;
  for (const kw of TARGET_TECH_KEYWORDS) {
    if (lowerTitle.includes(kw)) {
      hasTargetKw = true;
      titleScore += 10;
    }
  }

  if (!hasTargetKw) {
    return null;
  }

  // 3. Age filter
  const postedMs = new Date(raw.postedDate).getTime();
  const nowMs = Date.now();
  const daysOld = Math.max(0, Math.floor((nowMs - postedMs) / (1000 * 60 * 60 * 24)));
  if (daysOld > maxDaysOld) {
    return null;
  }

  // 4. Tags & Salary
  const tags = extractTags(raw.title, raw.description);
  const { salaryLPA, salaryEstimated } = parseSalaryLPA(raw.salaryRaw);

  // 5. Total Score
  const skillScore = tags.length * 3;
  const agePenalty = daysOld * 0.5;
  const salaryBonus = salaryLPA ? Math.min(10, salaryLPA / 3) : 0;
  const score = Math.round((titleScore + skillScore + salaryBonus - agePenalty) * 10) / 10;

  const id = generateJobId(raw.company, raw.title, raw.url);

  return {
    id,
    title: raw.title.trim(),
    company: raw.company.trim(),
    location: raw.location.trim() || 'Remote',
    url: raw.url.trim(),
    source: raw.source,
    salaryRaw: raw.salaryRaw,
    salaryLPA,
    salaryEstimated,
    postedDate: raw.postedDate,
    status: 'new',
    closed: false,
    tags,
    score,
  };
}
