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

- [ ] **Prompt 3: Shared Core Domain Package & Unit Test Suite**
  - [x] Implement Zod schemas for all Firestore documents and boundary payloads (`packages/shared/src/schemas`).
  - [x] Implement IST calendar utilities (`todayIST()`, formatting, day arithmetic) strictly avoiding unanchored `new Date()`.
  - [ ] Implement pure business functions:
    - [ ] Auto-derived daily counters for date $D$ (`problems`, `revisions`, `applications`, `mocks`).
    - [ ] Daily floor met evaluation (`floorMet(D)`).
    - [ ] Streak calculation engine (`currentStreak`, `longestStreak`, `totalFloorDays`, `atRisk`).
    - [ ] Spaced repetition revision engine (intervals `[1, 3, 7, 14, 30]`, mastery, penalty-free overdue queue).
    - [ ] Pattern coverage calculation against targets.
    - [ ] Salary normalization to LPA (INR, monthly, USD/EUR/GBP FX conversion).
  - [x] Author comprehensive Vitest test suite covering all pure domain functions and edge cases.

- [x] **Prompt 4: Web Application Foundation, Auth & Winter Arc Design System**
  - [x] Initialize Next.js App Router project in `/apps/web` with TypeScript strict mode.
  - [x] Configure Tailwind CSS with semantic "Winter Arc" tokens (dark theme default, light theme toggle).
  - [x] Install and configure shadcn/ui base primitives, Lucide icons, and typography (`Inter`, `Space Grotesk`, `JetBrains Mono`).
  - [x] Implement Bento Grid layout shell (12-column responsive grid with standard card sizes `S`, `M`, `W`, `T`, `L`, `XL`, `H`).
  - [x] Implement Card primitive with mandatory title row, body, loading skeleton, empty, and error states.
  - [x] Integrate Firebase Auth (Google Sign-In) with `OWNER_EMAIL` restriction and "Access Denied" guard.
  - [x] Define Firestore security rules (`request.auth.token.email == OWNER_EMAIL`) and rule substitution build script.

- [ ] **Prompt 5: Daily Logging (<60s Entry) & Dashboard Bento Grid**
  - [ ] Build rapid daily logging route (`/log`) optimized for completion in under 60 seconds.
  - [ ] Implement schedule block checklist, energy rating, top-3 priorities, and habit tracking.
  - [ ] Build Bento Dashboard (`/`) assembling operational cards:
    - [ ] Streak card with animated flame and "at-risk" warning indicator.
    - [ ] Daily floor status widget with live progress towards minimum floor.
    - [ ] Due revisions card sorted oldest-first.
    - [ ] Rapid problem solver and quick log action launchers.
  - [ ] Implement optimistic updates with toast notifications on mutation failures.

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
