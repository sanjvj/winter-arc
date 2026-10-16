import { loadSourcesConfig, executeScraper } from './runner';
import { fetchGreenhouseJobs } from './adapters/greenhouse';
import { fetchLeverJobs } from './adapters/lever';
import { fetchAshbyJobs } from './adapters/ashby';
import { scoreAndFilterJob } from './filter';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'dry-run';

  if (command === 'discover') {
    const candidates = [
      'razorpaysoftwareprivatelimited',
      'razorpay',
      'cred',
      'meesho',
      'inmobi',
      'slice',
      'groww',
      'canonical',
      'gitlab',
      'browserstack',
      'postman',
      'swiggy',
      'zomato',
      'zepto',
      'flipkart',
      'phonepe',
      'zerodha',
      'jupiter',
      'coindcx',
    ];

    console.log(`[Discover] Probing public ATS job board endpoints for ${candidates.length} candidate companies...\n`);
    const headers = { 'User-Agent': 'WinterArcBot/1.0 (personal job tracker)' };

    for (const c of candidates) {
      // Greenhouse
      try {
        const gh = await fetch(`https://boards-api.greenhouse.io/v1/boards/${c}/jobs`, { headers });
        if (gh.ok) {
          const d = (await gh.json()) as { jobs?: unknown[] };
          console.log(`✔ [Greenhouse] "${c}" responds: ${d.jobs?.length || 0} postings`);
        }
      } catch (err) {
        // Probe endpoint unreached or 404
        void err;
      }

      // Lever
      try {
        const lev = await fetch(`https://api.lever.co/v0/postings/${c}?mode=json`, { headers });
        if (lev.ok) {
          const d = (await lev.json()) as unknown[];
          if (Array.isArray(d) && d.length > 0) {
            console.log(`✔ [Lever] "${c}" responds: ${d.length} postings`);
          }
        }
      } catch (err) {
        // Probe endpoint unreached or 404
        void err;
      }

      // Ashby
      try {
        const ash = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${c}`, { headers });
        if (ash.ok) {
          const d = (await ash.json()) as { jobs?: unknown[] };
          console.log(`✔ [Ashby] "${c}" responds: ${d.jobs?.length || 0} postings`);
        }
      } catch (err) {
        // Probe endpoint unreached or 404
        void err;
      }
    }
    return;
  }

  if (command === 'test-source') {
    const targetName = args[1];
    if (!targetName) {
      console.error('Error: specify source name (e.g. pnpm scraper test-source Razorpay)');
      process.exit(1);
    }

    const sources = loadSourcesConfig();
    const source = sources.find((s) => s.name.toLowerCase() === targetName.toLowerCase());
    if (!source) {
      console.error(`Error: Source "${targetName}" not found in config/sources.json`);
      process.exit(1);
    }

    console.log(`[TestSource] Fetching raw jobs from ${source.name} (${source.type})...`);
    let rawJobs: import('./types').RawJob[] = [];
    if (source.type === 'greenhouse') rawJobs = await fetchGreenhouseJobs(source);
    else if (source.type === 'lever') rawJobs = await fetchLeverJobs(source);
    else if (source.type === 'ashby') rawJobs = await fetchAshbyJobs(source);

    console.log(`Fetched ${rawJobs.length} raw postings.`);
    const kept: import('./types').ScoredJob[] = [];
    for (const raw of rawJobs) {
      const scored = scoreAndFilterJob(raw);
      if (scored) kept.push(scored);
    }

    console.log(`Filtered down to ${kept.length} target SDE/Fresher roles:`);
    for (const job of kept.slice(0, 10)) {
      console.log(` - [Score ${job.score}] ${job.company} — ${job.title} (${job.location})`);
      console.log(`   URL: ${job.url}`);
      if (job.salaryLPA) console.log(`   Salary: ₹${job.salaryLPA} LPA`);
      if (job.tags.length) console.log(`   Tags: ${job.tags.join(', ')}`);
    }
    return;
  }

  // dry-run or run
  console.log(`[Scraper] Executing in ${command.toUpperCase()} mode...`);
  const sources = loadSourcesConfig();
  const startTime = Date.now();
  const result = await executeScraper(sources);
  const durationMs = Date.now() - startTime;

  console.log(`\n================= SCRAPE SUMMARY (${durationMs}ms) =================`);
  console.log(`Total Postings Fetched: ${result.totalFetched}`);
  console.log(`Total Relevant SDE-1 / Fresher Roles Kept: ${result.jobs.length}`);
  console.log('\nPer-Source Breakdown:');
  for (const src of result.perSource) {
    const status = src.error ? `FAILED: ${src.error}` : `OK (${src.kept}/${src.fetched} kept)`;
    console.log(` - ${src.name.padEnd(14)}: ${status}`);
  }

  console.log(`\nTop Curated Openings (Ranked by Relevance Score):`);
  for (let i = 0; i < Math.min(result.jobs.length, 15); i++) {
    const j = result.jobs[i];
    if (!j) continue;
    const sal = j.salaryLPA ? ` | ₹${j.salaryLPA} LPA` : '';
    console.log(`${(i + 1).toString().padStart(2, ' ')}. [${j.company}] ${j.title} (${j.location})${sal}`);
    console.log(`    URL: ${j.url}`);
    if (j.tags.length) console.log(`    Tags: ${j.tags.join(', ')}`);
  }
  console.log('=================================================================\n');

  if (command === 'run') {
    const uid = process.env.OWNER_UID || 'ORosUow0nbPZvzQH823KFdree5v2';
    console.log(`[Scraper] Ingesting ${result.jobs.length} jobs into Firestore for owner UID: ${uid}...`);
    try {
      const { ingestJobsToFirestore } = await import('./runner');
      await ingestJobsToFirestore(uid, result);
      console.log(`✔ [Scraper] Successfully synced ${result.jobs.length} jobs to Firestore users/${uid}/jobs!`);
    } catch (err) {
      console.warn(`[Scraper] Note: Firestore Admin write skipped: ${(err as Error).message}`);
      console.log(`[Scraper] (To automate CLI writes, provide FIREBASE_PRIVATE_KEY or use the web dashboard "Sync Live Jobs" button)`);
    }
  }
}

main().catch((err) => {
  console.error('[Scraper] Fatal error:', err);
  process.exit(1);
});
