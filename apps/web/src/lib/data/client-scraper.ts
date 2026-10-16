import { collection, writeBatch, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Job, isIndiaOrRemote, isEntryLevel, extractExperienceYears } from '@winter-arc/shared';

const SOURCES = [
  { type: 'greenhouse', name: 'Razorpay', token: 'razorpaysoftwareprivatelimited' },
  { type: 'greenhouse', name: 'Groww', token: 'groww' },
  { type: 'greenhouse', name: 'InMobi', token: 'inmobi' },
  { type: 'greenhouse', name: 'Slice', token: 'slice' },
  { type: 'greenhouse', name: 'HackerRank', token: 'hackerrank' },
  { type: 'greenhouse', name: 'Postman', token: 'postman' },
  { type: 'lever', name: 'CRED', company: 'cred' },
  { type: 'lever', name: 'Meesho', company: 'meesho' },
  { type: 'lever', name: 'Paytm', company: 'paytm' },
  { type: 'lever', name: 'Zeta', company: 'zeta' },
  { type: 'greenhouse', name: 'Canonical', token: 'canonical' },
];

const BLACKLIST_KEYWORDS = [
  'senior', 'sr.', 'sr ', 'lead', 'staff', 'principal', 'director',
  'vp', 'vice president', 'manager', 'head of', 'architect', 'chief', 'sales',
  'recruiter', 'accountant', 'talent', 'legal', 'counsel', 'hr'
];

const TARGET_TECH_KEYWORDS = [
  'software', 'engineer', 'developer', 'sde', 'frontend', 'front-end',
  'backend', 'back-end', 'fullstack', 'full-stack', 'mts', 'graduate',
  'associate', 'intern', 'systems', 'platform', 'devops', 'infrastructure',
  'data engineer', 'qa', 'automation'
];

const KNOWN_SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js',
  'Python', 'Java', 'Spring Boot', 'Go', 'Golang', 'C++',
  'Rust', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GCP'
];

function extractTags(title: string, desc: string): string[] {
  const combined = `${title} ${desc}`.toLowerCase();
  const tags: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    if (combined.includes(skill.toLowerCase())) {
      tags.push(skill);
    }
  }
  return tags.slice(0, 5);
}

function parseSalaryLPA(raw?: string): { salaryLPA?: number; salaryEstimated: boolean } {
  if (!raw) return { salaryEstimated: false };
  const lpaMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:lpa|lac|lakh|l)/i);
  if (lpaMatch && lpaMatch[1]) {
    const minVal = parseFloat(lpaMatch[1]);
    const maxVal = lpaMatch[2] ? parseFloat(lpaMatch[2]) : minVal;
    return { salaryLPA: Math.round(((minVal + maxVal) / 2) * 10) / 10, salaryEstimated: false };
  }
  const usdMatch = raw.match(/\$\s*(\d{2,3}),?(\d{3})\b/);
  if (usdMatch) {
    const usd = parseInt(`${usdMatch[1]}${usdMatch[2]}`, 10);
    return { salaryLPA: Math.round(((usd * 84) / 100000) * 10) / 10, salaryEstimated: true };
  }
  return { salaryEstimated: false };
}

function isTargetJob(title: string): boolean {
  const lower = title.toLowerCase();
  for (const kw of BLACKLIST_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) return false;
  }
  for (const kw of TARGET_TECH_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

export async function syncLiveJobsFromBrowser(uid: string): Promise<{ totalFetched: number; totalSaved: number }> {
  const collectedJobs: Job[] = [];
  let totalFetched = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const src of SOURCES) {
    try {
      if (src.type === 'greenhouse') {
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${src.token}/jobs?content=true`);
        if (!res.ok) continue;
        const data = await res.json();
        const jobs = data.jobs || [];
        totalFetched += jobs.length;

        for (const item of jobs) {
          if (!isTargetJob(item.title)) continue;
          const content = item.content || '';
          // Strictly allow only entry-level (0-1 yr exp)
          if (!isEntryLevel(item.title, content)) continue;

          const loc = item.location?.name || 'Remote';
          // Strictly allow only India or open Remote roles
          if (!isIndiaOrRemote(loc)) continue;

          const postedDate = item.updated_at ? item.updated_at.slice(0, 10) : today;
          const tags = extractTags(item.title, content);
          const expYears = extractExperienceYears(content) || 0;
          const id = `gh-${src.name.toLowerCase()}-${item.id}`;
          collectedJobs.push({
            id,
            title: item.title,
            company: src.name,
            location: loc,
            url: item.absolute_url,
            source: 'greenhouse',
            postedDate,
            status: 'new',
            closed: false,
            tags,
            experienceMinYears: expYears,
            salaryEstimated: false,
          });
        }
      } else if (src.type === 'lever') {
        const res = await fetch(`https://api.lever.co/v0/postings/${src.company}?mode=json`);
        if (!res.ok) continue;
        const list = await res.json();
        if (!Array.isArray(list)) continue;
        totalFetched += list.length;

        for (const item of list) {
          if (!isTargetJob(item.text)) continue;
          const desc = item.descriptionPlain || item.description || '';
          // Strictly allow only entry-level (0-1 yr exp)
          if (!isEntryLevel(item.text, desc)) continue;

          const loc = item.categories?.location || 'Remote';
          // Strictly allow only India or open Remote roles
          if (!isIndiaOrRemote(loc)) continue;

          const postedDate = item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : today;
          const tags = extractTags(item.text, desc);
          const expYears = extractExperienceYears(desc) || 0;
          let salaryRaw: string | undefined;
          if (item.salaryRange && (item.salaryRange.min || item.salaryRange.max)) {
            salaryRaw = `${item.salaryRange.currency || 'INR'} ${item.salaryRange.min || ''} - ${item.salaryRange.max || ''}`;
          }
          const { salaryLPA, salaryEstimated } = parseSalaryLPA(salaryRaw);
          const id = `lever-${src.name.toLowerCase()}-${item.id}`;
          const leverJob: Job = {
            id,
            title: item.text,
            company: src.name,
            location: loc,
            url: item.hostedUrl || item.applyUrl,
            source: 'lever',
            postedDate,
            status: 'new',
            closed: false,
            tags,
            experienceMinYears: expYears,
            salaryEstimated,
            ...(salaryRaw ? { salaryRaw } : {}),
            ...(salaryLPA !== undefined ? { salaryLPA } : {}),
          };
          collectedJobs.push(leverJob);
        }
      }
    } catch (err) {
      console.warn(`[ClientScraper] Failed to fetch ${src.name}:`, err);
    }
  }

  // Deduplicate and batch write to Firestore
  const batch = writeBatch(db);
  const jobsCol = collection(db, 'users', uid, 'jobs');

  // Purge any existing non-India / non-remote or non-entry-level (>1 yr) jobs from Firestore
  const existingStatusMap = new Map<string, string>();
  try {
    const existingSnap = await getDocs(jobsCol);
    for (const d of existingSnap.docs) {
      const data = d.data();
      const notIndiaOrRemote = !isIndiaOrRemote(data.location);
      const notEntryLevel = !isEntryLevel(data.title || '', '', data.experienceMinYears);
      if (notIndiaOrRemote || notEntryLevel) {
        batch.delete(d.ref);
      } else {
        existingStatusMap.set(d.id, data.status || 'new');
      }
    }
  } catch (err) {
    console.warn('[ClientScraper] Failed to query existing jobs for cleanup:', err);
  }

  // Unique scraped jobs
  const uniqueJobs = Array.from(new Map(collectedJobs.map((j) => [j.id, j])).values());
  let savedCount = 0;

  for (const job of uniqueJobs) {
    if (!job.id) continue;
    const existingStatus = existingStatusMap.get(job.id);

    // CRITICAL: If the user previously dismissed this job, NEVER resurrect it back to 'new'!
    if (existingStatus === 'dismissed') {
      continue;
    }

    // Preserve existing user interactions (e.g. 'saved' or 'applied')
    const finalStatus = existingStatus || 'new';

    // Strip any keys with undefined values before calling Firestore batch.set
    const cleanJob: Record<string, unknown> = {
      status: finalStatus,
      updatedAt: serverTimestamp(),
    };
    for (const [key, val] of Object.entries(job)) {
      if (val !== undefined) {
        cleanJob[key] = val;
      }
    }

    const docRef = doc(jobsCol, job.id);
    batch.set(docRef, cleanJob, { merge: true });
    savedCount++;
  }


  if (savedCount > 0 || existingStatusMap.size > 0) {
    await batch.commit();
  }

  return { totalFetched, totalSaved: savedCount };
}

