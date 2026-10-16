# Architecture Decision Records (ADR) — Winter Arc Command Center

This log records every non-obvious architectural, design, and dependency decision made throughout the development of the Winter Arc Command Center.

## Policy

- Every deviation from [`docs/SPEC.md`](file:///home/sanjay/Desktop/docs/SPEC.md), new library addition outside the approved tech stack, or non-obvious trade-off must be appended here immediately.
- Entries are immutable once recorded. If a decision is superseded, append a new ADR that explicitly references and supersedes the earlier record.

---

## Decision Log

### ADR-001: Standalone OpenJDK 21 Runtime for Firebase Emulators

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** `firebase-tools` v15 enforces a hard check requiring Java 21+ to run the Firestore and Auth emulators. The system environment only had OpenJDK 17 installed, and root/sudo permissions were unavailable to install system-wide apt packages.
- **Decision:** Installed Eclipse Temurin OpenJDK 21 (`jdk-21.0.4+7`) into user-space directory `~/.local/jvm/jdk-21.0.4+7` and created `scripts/with-env.sh` to transparently export `JAVA_HOME` and prepend Java 21 to `PATH` for emulator scripts (`pnpm dev:emu`, `pnpm test:rules`).
- **Rationale & Alternatives Considered:** Installing in user space isolates dependencies from OS packages, avoids requiring elevated sudo privileges, and ensures deterministic emulator execution across developer machines.
- **Impact & Consequences:** Local emulators and emulator rules testing work reliably out-of-the-box without modifying global host packages.

### ADR-002: Build-Time Literal Email Injection into Firestore Rules

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Firestore security rules do not support reading dynamic environment variables at evaluation time. Spec Section 3 mandates that `request.auth.token.email == OWNER_EMAIL` be enforced via literal substitution.
- **Decision:** Created `firestore.rules.template` with a placeholder `__OWNER_EMAIL__` and a lightweight build script `scripts/build-rules.js` (`pnpm rules:build`) executed during `pnpm build`, CI, and emulator launch.
- **Rationale & Alternatives Considered:** Hardcoding emails directly into version control leaks credentials and prevents testing with mock owner emails. Build-time injection maintains clean secret hygiene.
- **Impact & Consequences:** Build step `pnpm rules:build` is added as a prerequisite in `package.json` build and CI workflows. Default fallback is set to `sanjay@winterarc.local` for local development.

### ADR-003: Server-Side API Token Generation with SHA-256 Storage

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** The Chrome autofill extension requires an API token to interact with `/api/ext/*`. Spec Section 3 requires generating 32 cryptographically secure random bytes, displaying the token once in the UI, and storing only its SHA-256 hash in Firestore.
- **Decision:** Implemented Next.js route `/api/token` using `firebase-admin`. The route verifies the caller's Firebase ID token against `OWNER_EMAIL`. On POST, it generates 32 bytes using Node's `crypto.randomBytes(32).toString('hex')`, computes the SHA-256 hex digest, and stores the hash at `users/{uid}/settings/main.apiTokenHash`. The raw token is returned once in the response. On DELETE, it sets `apiTokenHash` to empty string.
- **Rationale & Alternatives Considered:** Generating tokens server-side ensures raw tokens never pass through or get calculated on untrusted clients. Storing solely the SHA-256 digest ensures zero recovery of the token even if Firestore read rules or client memory were inspected.
- **Impact & Consequences:** The user must copy the generated token immediately upon creation; revoked tokens instantly invalidate subsequent `/api/ext/*` requests.

### ADR-004: In-Memory Dry-Run Verification for User Data Import

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Spec Section 6 and 9 mandate typed data boundaries and robust error recovery. Importing a full user backup JSON without validation risks data corruption or overwriting active collections with invalid structures.
- **Decision:** Implemented `analyzeImportData()` in `apps/web/src/lib/data/export-import.ts`. The dry run parses the JSON payload, checks version compliance (`version === 1`), tallies candidate document counts per collection (settings, roadmap, problems, applications, mocks, etc.), and renders an interactive summary modal with counts before executing `commitImportData()` via Firestore `writeBatch`.
- **Rationale & Alternatives Considered:** Direct writes without preview could result in silent failures or partial corruptions. In-memory dry run gives full visibility and user control before mutating the database.
- **Impact & Consequences:** Users can inspect what is about to be imported and cancel safely if counts or structures look unexpected.

### ADR-005: Pure Domain Floor & Streak Engine with At-Risk Evaluation

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Spec 7.2 and 7.3 require calculating daily floor compliance (with dueRevisionsAtStart == 0 boundary condition) and consecutive-day streaks. Evaluating streaks strictly from today would cause a false "0-day streak" during active working hours before today's daily log is submitted.
- **Decision:** Implemented `evaluateFloorMet()` and `calculateStreak()` in `packages/shared`. If today's floor is not yet met, the engine evaluates continuity starting from yesterday (`referenceDate - 1`). If yesterday was completed, the current streak count is preserved, and today is flagged with `atRisk: true`. If yesterday was missed, the streak is 0. If today is completed, today is counted and `atRisk: false`.
- **Rationale & Alternatives Considered:** Treating an unclosed active day as an instant streak failure destroys habit momentum and contradicts Spec 7.3. The `atRisk` flag allows the UI to surface motivational warning banners after 18:00 IST while keeping the streak technically intact until midnight.
- **Impact & Consequences:** Dashboard hero, streak card, and in-app warning banners dynamically reflect `atRisk` state.

### ADR-006: Spaced Repetition Engine & Zero-Dependency Active Recall Architecture

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Spec 7.4 mandates a 5-step spaced repetition schedule (`[1, 3, 7, 14, 30]` days), fast-tracking clean solves $\le 25\text{ mins}$ to Step 2 (+7d), resetting failures to Step 0 due tomorrow, strictly ignoring same-day repeat reviews (idempotency), and advancing overdue items by exactly one step only regardless of overdue duration. Furthermore, pattern cheat sheets require markdown preview while adhering strictly to Rule 6 (zero unapproved external dependencies).
- **Decision:**
  1. Implemented `initProblemRevision`, `advanceRevision`, `getRevisionQueue`, `getRevisionForecast`, and `calculatePatternCoverage` as pure functions in `packages/shared` covered by 23 dedicated Vitest unit tests.
  2. Built a clean, zero-dependency Markdown parser and renderer inside `PatternCheatSheets` to avoid introducing external dependencies.
  3. Built an active recall mask in `ActiveRecallModal` concealing problem insights and notes until explicit <kbd>Space</kbd> revelation, with keyboard-driven <kbd>p</kbd> (Pass) and <kbd>f</kbd> (Fail) workflows.
  4. Implemented RFC 4180 compliant CSV parser and exporter (`packages/shared/src/csv.ts`) with flexible Notion column aliasing and dry-run URL duplicate detection.
- **Rationale & Alternatives Considered:** Hand-crafting the lightweight markdown preview and CSV parser prevented adding heavy external dependencies (`react-markdown`, `papaparse`) while guaranteeing 100% type safety and performance.
- **Impact & Consequences:** Problems logged in `/dsa` immediately schedule spaced reviews, feed the 14-day projection in `/revision`, and dynamically update dashboard Bento cards (`RevisionsDueCard`, `PatternCoverageCard`, `MistakeCard`).

### ADR-007: Job Search Tracking Surface Architecture (Pipeline Kanban, Mocks, Roadmap & Weekly Review)

- **Date:** 2026-10-16
- **Status:** Accepted
- **Context:** Implementing the complete tracking surface required:
  1. An 8-stage Kanban board with accessible drag-and-drop (`@dnd-kit`).
  2. Automatic transition invariants: moving an application to `applied` sets `appliedDate` to today if unset, and every stage change appends to `statusHistory`.
  3. Feedback loop linking mock interview weaknesses/action items directly into roadmap milestones with one click.
  4. Weekly review engine with objective scorecard, best/worst day identification, deterministic fact-only "Honest Read" rule engine, and 4-week month rollups.
- **Decision:**
  1. Installed approved `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` in `apps/web` with 5px pointer activation distance allowing click-to-edit without triggering drags.
  2. Implemented `calculatePipelineFunnel` and `getOverdueFollowUps` in `packages/shared/src/funnel.ts`.
  3. Implemented `calculateWeeklySummary`, `generateHonestRead`, and `calculateMonthRollup` in `packages/shared/src/weekly-review.ts`. Candidate days for best/worst day evaluation are restricted to days with recorded activity so future unlogged days are not falsely branded as the worst day.
  4. Designed the "Honest Read" engine to evaluate strictly verifiable facts (e.g., application targets vs actuals, mock interview completion, streak floor integrity, sleep and startup hours), completely avoiding speculative psychological statements.
  5. Implemented one-click action to turn any mock interview action item into an active week goal in `roadmap/main`.
  6. Added an overdue follow-up count badge next to "Pipeline Kanban" in `sidebar.tsx` and connected live metrics to dashboard bento cards.
- **Rationale & Alternatives Considered:** Pure calculation logic and honest-read rule evaluation reside exclusively in `packages/shared` with 100% test coverage, maintaining clean separation between domain logic and presentation.
- **Impact & Consequences:** The complete tracking loop—applications, mock defense, syllabus milestones, and weekly retrospectives—is fully interactive, strongly typed, and persists to Firestore.

---

### ADR Template (For Future Entries)

```markdown
### ADR-XXX: [Short Title of Decision]

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by ADR-YYY
- **Context:** What problem or trade-off necessitated this decision?
- **Decision:** What was chosen?
- **Rationale & Alternatives Considered:** Why was this chosen over alternatives?
- **Impact & Consequences:** What are the trade-offs, limitations, or downstream changes?
```
