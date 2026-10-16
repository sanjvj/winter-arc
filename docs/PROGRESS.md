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
  - [ ] Build Applications Kanban pipeline (`/pipeline`) using `@dnd-kit` across statuses (`saved`, `applied`, `oa`, `interview`, `offer`, etc.).
  - [ ] Build DSA problem tracker view (`/dsa`) with pattern tags and solution insight logging.
  - [ ] Build Spaced Repetition queue view (`/revision`) with pass/fail review actions.
  - [ ] Build Mistakes journal (`/mistakes`), Mock interviews tracker (`/mocks`), Roadmap syllabus (`/roadmap`), and Weekly reviews (`/review`).

- [ ] **Prompt 8: Autofill Chrome Extension (Manifest V3)**
  - [ ] Initialize `/apps/extension` with Vite, TypeScript, and Chrome Manifest V3.
  - [ ] Implement master profile options view in React (personal info, education, links, work history).
  - [ ] Build Next.js route handlers under `/api/ext/*` secured by SHA-256 hashed 32-byte personal API token.
  - [ ] Implement content script form filler:
    - [ ] Maps master profile fields to job portal inputs (Workday, Greenhouse, Lever, etc.).
    - [ ] Learns unmapped/novel form fields and saves mappings back to extension storage.
    - [ ] Enforces strict safety guarantee: never automatically submits any form.
  - [ ] Build `/extension` page in web app for token generation, revocation, and setup guide.

- [ ] **Prompt 9: Verification, Demo Data Suite, E2E Testing & Deployment**
  - [ ] Implement isolated demo data generator behind explicit `"Load demo data"` and `"Clear demo data"` in `/settings`.
  - [ ] Author Playwright end-to-end tests covering auth gate, daily logging workflow, and pipeline drag-and-drop.
  - [ ] Verify zero color hardcoding and full WCAG AA contrast compliance.
  - [ ] Verify all bundle sizes, lint checks, type checks, and build outputs.
  - [ ] Finalize Vercel production deployment configuration and document operating runbook.
