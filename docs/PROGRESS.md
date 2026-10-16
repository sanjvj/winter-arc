# Winter Arc Command Center — Implementation Progress

This document tracks the phased implementation across Prompts 1 through 9.

---

## Phased Implementation Checklist

- [x] **Prompt 1: Project Documentation & Engineering Rules Setup**
  - [x] Initialize `/docs/SPEC.md` capturing complete requirements with zero omissions.
  - [x] Configure workspace engineering rules in `GEMINI.md` and mirror at `AGENTS.md`.
  - [x] Create architecture decision log `/docs/DECISIONS.md`.
  - [x] Establish phased implementation roadmap in `/docs/PROGRESS.md`.

- [x] **Prompt 2: Monorepo & Workspaces Architecture**
  - [x] Initialize `pnpm` workspaces (`/apps/web`, `/apps/scraper`, `/apps/extension`, `/packages/shared`).
  - [x] Configure root and package `tsconfig.json` with strict mode.
  - [x] Configure unified ESLint, Prettier, and formatting scripts.
  - [x] Configure root `package.json` scripts (`lint`, `typecheck`, `test`, `build`).
  - [x] Set up GitHub Actions CI workflow for pull requests and main branch commits.

- [x] **Prompt 3: Typed Data Access, First-Login Seed & Complete Settings**
  - [x] Typed data hooks in `apps/web/src/lib/data`: `useDoc`, `useCollection`, `mutations` (`setDocument`, `updateDocument`, `deleteDocument`, `addDocument`), `pagination`, central error handling with toasts.
  - [x] First-login seed (`seedFirstLogin` in `apps/web/src/lib/data/seed.ts`):
    - [x] `settings/main`: 13 schedule blocks, 18 pattern targets (sum 168), complete job filters with skill weights and FX rates.
    - [x] `roadmap/main`: 12 weeks with 3-5 theme-derived goal checkboxes and 36 topics across 6 groups.
  - [x] Settings page (`/settings`):
    - [x] Plan length & start date with live "Day X of 90" indicator.
    - [x] Daily floor minimums and target goals.
    - [x] Schedule blocks editor (add, remove, move up/down, time validation).
    - [x] Pattern targets editor with live sum counter (168 target).
    - [x] Job filters with chip inputs, weight selector, and FX rates.
    - [x] Appearance theme switcher (dark, light, system).
    - [x] Account & security: UID copy, API token modal with 32-byte generation and SHA-256 server storage.
    - [x] Data management: JSON export, dry-run import preview with entity counts, demo data load/clear.
  - [x] Comprehensive test suite: seeds fixtures, schedule reordering/validation, export/import dry run, API token hashing, and settings schemas (41 unit tests + 5 Firestore rules tests).

- [x] **Prompt 4: Web Application Foundation, Auth & Winter Arc Design System**
  - [x] Initialize Next.js App Router project in `/apps/web` with TypeScript strict mode.
  - [x] Configure Tailwind CSS with semantic "Winter Arc" tokens (dark theme default, light theme toggle).
  - [x] Install and configure shadcn/ui base primitives, Lucide icons, and typography (`Inter`, `Space Grotesk`, `JetBrains Mono`).
  - [x] Implement Bento Grid layout shell (12-column responsive grid with standard card sizes `S`, `M`, `W`, `T`, `L`, `XL`, `H`).
  - [x] Implement Card primitive with mandatory title row, body, loading skeleton, empty, and error states.
  - [x] Integrate Firebase Auth (Google Sign-In) with `OWNER_EMAIL` restriction and "Access Denied" guard.
  - [x] Define Firestore security rules (`request.auth.token.email == OWNER_EMAIL`) and rule substitution build script.

- [x] **Prompt 5: Daily Logging (<60s Entry) & Dashboard Bento Grid**
  - [x] Pure domain calculations in `packages/shared`:
    - [x] Spec 7.1 Auto-derived counters (`calculateDailyCounters`) with override support.
    - [x] Spec 7.2 Floor completion check (`evaluateFloorMet`) with `dueRevisionsAtStart == 0` boundary handling.
    - [x] Spec 7.3 Streak engine (`calculateStreak`) with at-risk states, gap detection, month/year boundaries, and DST-free IST.
    - [x] Sleep duration calculation (`calculateSleepHours`) with cross-midnight support.
    - [x] Comprehensive Vitest tests in `packages/shared` (53 passing unit tests).
  - [x] Rapid daily logging route (`/log`):
    - [x] 7-day quick date switcher (today + prior 6 days) with status pills.
    - [x] Top metric strip with 4 counters, floor targets, tap-to-override modals, and jump links.
    - [x] Sleep/wake times with auto-computed sleep hours, startup hour stepper, gym toggle, 1-5 energy rating, win/loss inputs, and top-3 priorities.
    - [x] Schedule blocks checklist from settings with live ticking.
    - [x] Debounced autosave (800ms) with save timestamp indicator.
    - [x] "Close the day" button with celebratory or missing-requirements modal and updated streak.
    - [x] Responsive layout optimized for 375px phone with large touch targets (<60s completion).
  - [x] Dashboard (`/`) Bento Layout:
    - [x] Desktop 12-column grid and 6-column tablet reflow with exact card sizes (`H`, `M`, `L`, `XL`, `W`).
    - [x] Single-column mobile order with priority: Hero, Floor rings, Checklist, Revisions due, Job feed, Streak, Hours, Week, Pipeline, Pattern coverage, Heatmap, rest.
    - [x] All 16 cards implemented with loading skeletons, graceful empty states with call-to-actions, and error boundaries.
  - [x] App shell integration:
    - [x] Real-time Day X of 90 and Streak chips in desktop sidebar.
    - [x] In-app warning banners: after 18:00 IST if floor unmet ("Streak at risk") and after 21:00 IST if log open.

- [ ] **Prompt 6: Automated Job Scraper & Firestore Feed Ingestion**
  - [ ] Set up `/apps/scraper` with Node 20, TypeScript, `undici`, `cheerio`, and `firebase-admin`.
  - [ ] Define job document schema in Firestore (`users/{uid}/jobs/{jobId}`).
  - [ ] Implement career portal and board scraping adapters for fresh SDE-1 / fresher openings.
  - [ ] Implement deduplication and filtering engine (keywords, locations, salary, experience, age limit).
  - [ ] Persist scraper run metrics and audit logs in `scraperRuns/{runId}`.
  - [ ] Configure GitHub Actions cron workflow to trigger daily execution at 06:00 IST.

- [ ] **Prompt 7: Job Pipeline, Applications Kanban & Prep Trackers**
  - [ ] Build Job Feed view (`/jobs`) with filters, relevance ranking, and quick-save/dismiss actions.
  - [x] **Applications Pipeline Kanban (`/pipeline`):**
    - [x] 8-column Kanban board (`saved`, `applied`, `oa`, `interview`, `offer`, `rejected`, `ghosted`, `withdrawn`) with `@dnd-kit` drag-and-drop and keyboard accessibility.
    - [x] Moving to `applied` auto-sets `appliedDate` to today (`todayIST()`) if unset.
    - [x] Every status transition appends `{ status, date }` to `statusHistory`.
    - [x] Top "Follow-ups due" notification strip with quick complete and reschedule actions (+3d, +7d).
    - [x] Add/Edit drawer with all Spec 6 fields, salary, location, follow-up date, and history timeline.
    - [x] Quick Add drawer (shortcut <kbd>a</kbd>) with duplicate company + role warning alert.
    - [x] Table view toggle, search, status/source/referral filters, and RFC-4180 CSV export.
    - [x] Funnel stats bar: total applied, OA rate %, interview rate %, offer rate %, average days to first response, referral vs direct conversion.
  - [x] **Mock Interviews Tracker (`/mocks`):**
    - [x] Log form with chip inputs for strengths, weaknesses, action items, and problems tackled.
    - [x] Filterable list by interview type (`dsa`, `lld`, `system-design`, `behavioral`, `full-loop`, `hr`).
    - [x] Analytics charts: 1-5 score trend over time, weekly volume vs `mocksPerWeek` target, ranked frequent weakness tags.
    - [x] One-click action turning any action item into an active week milestone goal in `roadmap/main`.
  - [x] **Syllabus Roadmap (`/roadmap`):**
    - [x] 12-week timeline accordion with current week expanded, goal checkboxes, week & overall progress bars.
    - [x] Topics board grouped by discipline (`CS core`, `Full-stack`, `LLD designs`, `System design`, `Behavioral`) with `todo`/`doing`/`done` status toggles and per-group progress.
    - [x] Add/edit/remove milestone goals and syllabus topics.
  - [x] **Weekly Retrospective & Honest Read (`/review`):**
    - [x] Week picker with previous/next navigation for any Monday-Sunday week.
    - [x] 7-day metric scorecard table (problems, revisions, applications, mocks, startup hours, gym, sleep, energy, floor met) with daily mini charts.
    - [x] Objective Best Day and Worst Day identification with concrete metrics.
    - [x] Mistakes notebook review with "Mark Reviewed This Week" action.
    - [x] Roadmap goals planned vs completed checklist.
    - [x] Three reflection fields (`whatWorked`, `whatToChange`, `nextFocus`) saved to `weeklyReviews/{weekStart}`.
    - [x] Rule-based "Honest Read" engine flagging verifiable facts with zero psychological speculation.
    - [x] Month view tab rolling up Weeks 1-4, 5-8, and 9-12.
  - [x] **Dashboard & Shell Integration:**
    - [x] Overdue follow-ups count badge next to "Pipeline Kanban" in `sidebar.tsx`.
    - [x] Live Firestore data wiring for `PipelineFunnelCard`, `WeekGlanceCard`, `MocksCard`, `RoadmapCard`, and `HoursCard`.
  - [x] **The Learning Core (DSA Tracker, Spaced Revision, Cheat Sheets & Mistakes Notebook):**
    - [x] Pure Spec 7.4 revision engine & Spec 7.5 pattern coverage functions in `packages/shared` with 23 Vitest tests (clean solve fast-track, fail resets to Step 0 due tomorrow, double-review idempotency, overdue > interval 1-step advancement, 14-day forecast).
    - [x] DSA problem tracker (`/dsa`):
      - [x] Keyboard-first Add Problem drawer (shortcut `n`, <kbd>Esc</kbd> to close, <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save, URL auto-platform & title extraction, 200-char insight guard, sub-20s logging).
      - [x] Problem table with multi-criteria filtering (pattern, difficulty, outcome, status), sorting, and pagination.
      - [x] Problem detail view with full revision history timeline.
      - [x] Pattern coverage section with 18 progress bars and weakest 3 patterns callout.
      - [x] Pattern cheat sheets tab with 18 standard patterns, template pre-fill, zero-dependency Markdown preview, and debounced Firestore autosave.
      - [x] CSV pipeline: Notion-format import with column mapping, dry-run preview, duplicate URL detection, error report, and CSV export.
    - [x] Active Recall Revision queue (`/revision`):
      - [x] Queue overview with KPIs (Due Today, Overdue, Mastered, Total Queue) and 14-day visual forecast bar chart.
      - [x] Active recall review mode: problem metadata with timer; key insight and anti-pattern concealed until <kbd>Space</kbd> reveal; <kbd>p</kbd> to Pass, <kbd>f</kbd> to Fail; instant interval toast feedback and session summary.
    - [x] Mistakes journal (`/mistakes`):
      - [x] One-line quick-add bar with shortcut `m`.
      - [x] Weekly grouped list with batch "Mark Week Reviewed" action appending to `reviewedWeeks`.
      - [x] Weekly review mode walking through the last 7 days of mistakes.
      - [x] "Most Repeated" view with pattern breakdown and automated semantic anti-pattern clustering.
    - [x] Dynamic dashboard integration: `dueRevisionsAtStart` captured in daily log; `RevisionsDueCard`, `PatternCoverageCard`, and `MistakeCard` live-wired to Firestore.

- [ ] **Prompt 8: Autofill Chrome Extension (Manifest V3)**
  - [ ] Initialize `/apps/extension` with Vite, TypeScript, and Chrome Manifest V3.
  - [ ] Implement master profile options view in React (personal info, education, links, work history).
  - [ ] Build Next.js route handlers under `/api/ext/*` secured by SHA-256 hashed 32-byte personal API token.
  - [ ] Implement content script form filler:
    - [ ] Maps master profile fields to job portal inputs (Workday, Greenhouse, Lever, etc.).
    - [ ] Learns unmapped/novel form fields and saves mappings back to extension storage.
    - [ ] Enforces strict safety guarantee: never automatically submits any form.
  - [ ] Build `/extension` page in web app for token generation, revocation, and setup guide.

- [x] **Prompt 9: Verification, Demo Data Suite, E2E Testing & Deployment**
  - [x] Implement isolated demo data generator behind explicit `"Load demo data"` and `"Clear demo data"` in `/settings`.
  - [x] Author Playwright end-to-end tests covering auth gate, daily logging workflow, and pipeline drag-and-drop.
  - [x] Verify zero color hardcoding and full WCAG AA contrast compliance.
  - [x] Verify all bundle sizes, lint checks, type checks, and build outputs.
  - [x] Finalize Vercel production deployment configuration and document operating runbook.

- [x] **Prompt 10: Adversarial QA Audit, Multi-Device Screenshot Pass & Compliance Verification**
  - [x] Playwright E2E test suite covering 10 adversarial scenarios (A through J) with 100% pass rate in 30.7s.
  - [x] Responsive screenshot pass across all 12 operational views at 375px, 768px, and 1440px (36 full-page captures in `/docs/screenshots/`).
  - [x] Security audit covering Firestore rules (`tests/rules/firestore.test.ts`), SHA-256 personal API token hashing, constant-time compare, and sliding-window rate limiting (60 req/min).
  - [x] Scraper protocol compliance audit (User-Agent header, robots.txt, zero login walls, closed-job detection invariant).
  - [x] Delivery of `/docs/QA_REPORT.md` with complete pass/fail matrix, bug resolution log, and GO deployment verdict.

- [x] **Prompt 11: Live Firebase Hosting Deployment, Spark Tier Static Architecture & Favicon Resolution**
  - [x] Connected live Firebase project `winter-arc-c2def` with owner `sanjaysurya3010@gmail.com`.
  - [x] Configured Next.js App Router for zero-cost static export (`output: 'export'`) in `apps/web/next.config.js`.
  - [x] Moved server-only API routes to `apps/web/api-routes/` and migrated API token generation to client-side Web Crypto API.
  - [x] Deployed strict Firestore Security Rules and compound composite indexes to live Cloud Firestore.
  - [x] Normalized trailing-slash routing in `auth-gate.tsx`, `app-shell.tsx`, `sidebar.tsx`, and `mobile-nav.tsx` resolving blank screen on Firebase Hosting.
  - [x] Created `apps/web/public/` with `favicon.ico`, `favicon.svg`, `icon-192.png`, `icon-512.png`, and `manifest.json`.
  - [x] Deployed to Firebase Hosting (`https://winter-arc-c2def.web.app`) with verified HTTP 200 for favicon, manifest, and login interface.

