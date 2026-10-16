# Winter Arc Command Center — System Specification

> **Status:** Approved Baseline  
> **Target Audience:** Single-User Personal Product (Sanjay)  
> **Revision:** 1.0.0

---

## 1. Product Overview

- **Owner:** Sanjay, full-stack developer, 2025 Computer Science graduate.
- **Objective:** Executing a disciplined 90-day job hunt strategy targeting SDE-1 / high-growth product-company roles, while concurrently operating a startup (4–5 hours/day) and maintaining physical fitness (gym 2 hours/day).
- **Core Architecture (Three Primary Components):**
  1. **Web App ("Command Center"):** A unified daily command dashboard consolidating the entire job search lifecycle, daily habit tracking, DSA preparation, revisions, mock interviews, and application pipeline. **Hard constraint:** Logging a complete day's activities must take under 60 seconds.
  2. **Job Scraper:** Autonomous scraper scheduled daily at 06:00 IST via GitHub Actions cron. Discovers, cleans, and normalizes fresh SDE and fresher job postings, feeding them directly into the Command Center's job feed.
  3. **Autofill Chrome Extension:** Chrome Manifest V3 extension that automatically fills repetitive job application portal forms using a single master profile entered once. Features adaptive form-learning to memorize novel fields. **Hard constraint:** Never auto-submits any application.
- **Explicit Non-Goals:** Multi-user tenancy, billing/payments, public social features, native mobile applications, auto-submitting job applications, bypassing CAPTCHAs, or scraping authenticated/logged-in platforms (LinkedIn, Naukri, Indeed).

---

## 2. Tech Stack

The technology stack is fixed. Any deviation must be explicitly justified and recorded in [`docs/DECISIONS.md`](file:///home/sanjay/Desktop/docs/DECISIONS.md).

| Layer                    | Technologies                                                                                                                                                                                                                                                                   |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**             | `pnpm` workspaces (`/apps/web`, `/apps/scraper`, `/apps/extension`, `/packages/shared`)                                                                                                                                                                                        |
| **Shared Package**       | TypeScript strict, Zod validation schemas, pure business logic, pure date/time helpers                                                                                                                                                                                         |
| **Web Frontend**         | Next.js (latest stable, App Router), TypeScript (strict mode), Tailwind CSS, shadcn/ui, Framer Motion, Recharts, lucide-react, `date-fns` + `date-fns-tz`, Zod, React Hook Form, `@dnd-kit`                                                                                    |
| **Backend / DB**         | Firebase Auth (Google Sign-In) + Cloud Firestore (Region: `asia-south1`) on the free Spark plan.<br>**Constraints:** Zero Cloud Functions, Zero Firebase Storage. All backend logic resides exclusively in Next.js Route Handlers (`/app/api/...`) utilizing `firebase-admin`. |
| **Hosting & Automation** | Vercel (Web deployment), GitHub Actions (daily 06:00 IST cron & CI pipeline)                                                                                                                                                                                                   |
| **Scraper Service**      | Node.js 20, TypeScript, native `fetch` / `undici`, `cheerio`, `firebase-admin`. Playwright reserved strictly as an optional source type for JavaScript-heavy dynamic portals.                                                                                                  |
| **Chrome Extension**     | Chrome Manifest V3, TypeScript, Vite-based build system, React strictly limited to Options and Popup pages.                                                                                                                                                                    |
| **Quality & CI**         | Vitest (unit & business logic tests), Playwright (end-to-end testing), ESLint, Prettier. GitHub Actions workflow validating `lint`, `typecheck`, `test`, and `build` on every push/PR.                                                                                         |

---

## 3. Security Model

- **Single-Tenant Ownership:**
  - Configured via environment variable `OWNER_EMAIL`.
  - Authentication powered by Firebase Auth (Google Sign-In).
  - Client-side and server-side verification: if the authenticated user's email does not strictly match `OWNER_EMAIL`, immediately terminate the session and render an **"Access Denied"** view.
- **Firestore Security Rules:**
  - Direct read/write access restricted to `/users/{uid}/**`.
  - Condition: `request.auth.uid == uid && request.auth.token.email == OWNER_EMAIL`.
  - The literal email address is substituted into the Firestore rules file during deployment by a dedicated build script from environment variables.
  - All other paths and unauthenticated access are denied by default (`deny all`).
  - The scraper accesses Firestore exclusively via the privileged `firebase-admin` service account.
- **Extension API Authentication:**
  - Route handlers under `/api/ext/*` are secured via a Personal API Token (32 cryptographically secure random bytes).
  - The token is displayed exactly once in Web Settings upon generation; only its cryptographic SHA-256 hash is persisted in Firestore (`settings/main.apiTokenHash`).
  - CORS for `/api/ext/*` is strictly locked down to the origin specified in `EXTENSION_ORIGIN` (Chrome extension URL).
- **Credential Hygiene:**
  - Secrets and credentials must never be committed to source control.
  - Every application and service maintains an up-to-date `.env.example`.
  - `.gitignore` strictly excludes `.env*`, `*.pem`, `serviceAccountKey.json`, and credentials.
  - **Zero credential storage:** Passwords, payment card numbers, and one-time passwords (OTPs) are never stored anywhere in this system.

---

## 4. Design System ("Winter Arc")

- **Theme Mode:** Dark theme default; light theme toggle available; honors system preference (`prefers-color-scheme`).
- **Color Tokens:**
  - Background: `#0A0B10`
  - Surface: `#12141C`
  - Surface-2: `#1A1D28`
  - Border: `rgba(255, 255, 255, 0.08)`
  - Text Primary: `#E7EAF3`
  - Text Muted: `#8B93A7`
  - Accent Ice: `#7DD3FC`
  - Accent Indigo: `#818CF8`
  - Status Success: `#34D399`
  - Status Warning: `#FBBF24`
  - Status Danger: `#F87171`
  - _Note:_ The light theme utilizes the identical hue palette calibrated on clean, high-contrast light surfaces.
- **Typography:**
  - UI Copy: `Inter`
  - Headings & KPI Big Numbers: `Space Grotesk`
  - Timers, Metric Counters & Code Blocks: `JetBrains Mono`
- **Bento Grid Architecture:**
  - Responsive CSS Grid: 12 columns at desktop (`>=1280px`), 6 columns at tablet (`>=768px`), 1 column on mobile (`<768px`).
  - Grid Gap: `16px`. Base row unit height: `160px`.
  - Card Aesthetics: `20px` border radius, `1px` subtle border, dark gradient backdrop, subtle `2px` hover lift.
  - Standardized Card Dimensions (columns × rows):
    - **S**: `3x1` (Small metric / badge)
    - **M**: `4x1` (Medium card / quick counter)
    - **W**: `6x1` (Wide single-row status bar)
    - **T**: `3x2` (Tall widget / mini checklist)
    - **L**: `4x2` (Large interactive block)
    - **XL**: `8x2` (Primary operational area / chart)
    - **H**: `8x1` (Hero horizontal ribbon)
  - Card States: Every card component must implement:
    1. Standard title row (Lucide icon, label text, optional action button).
    2. Body container.
    3. Loading skeleton state.
    4. Empty state.
    5. Error fallback state.
- **Motion & Animation:**
  - Transition timing: `150ms` – `250ms` ease-out.
  - Numerical count-up animations on initial dashboard mount.
  - Subtle breathing/pulse animation on the streak flame indicator.
  - Respect `prefers-reduced-motion` across all components.
- **Accessibility:**
  - Strict WCAG AA contrast compliance across both themes.
  - High-visibility keyboard focus rings (`focus-visible`).
  - Full keyboard navigability across all views.
  - Semantic ARIA labels on all visual charts and non-text iconography.
  - Never convey state through color alone (always combine color with icon/text).
- **Brand Voice & Microcopy:**
  - Short, direct, clear, disciplined, encouraging yet objective.
  - _Example:_ `"Floor not met yet: 1 more problem."`

---

## 5. Time & Calendar Rules

- **Standard Timezone:** `Asia/Kolkata` (Indian Standard Time, IST, UTC+05:30) across the entire system.
- **Definition of a Day:** A strict ISO calendar date string `YYYY-MM-DD` evaluated in IST.
- **Timestamps:** Persistent storage uses Firestore Timestamps.
- **Date Calculation Policy:**
  - Single centralized helper function `todayIST()` declared in `packages/shared`.
  - **Strict rule:** Calling unanchored `new Date()` for date/day resolution is strictly forbidden in application code.
- **Plan Tracking:**
  - Start date (`planStartDate`) and duration (`planLengthDays`, default `90`) are stored in `settings/main`.
  - Progress metric `"Day X of 90"` is dynamically derived from `planStartDate` and `todayIST()`.

---

## 6. Firestore Data Model

All user data is partitioned under `users/{uid}/`:

```
users/{uid}/
  ├── settings/main
  ├── dailyLogs/{date}
  ├── problems/{id}
  ├── mistakes/{id}
  ├── mocks/{id}
  ├── applications/{id}
  ├── jobs/{jobId}
  ├── scraperRuns/{runId}
  ├── roadmap/main
  ├── patternNotes/{pattern}
  └── weeklyReviews/{weekStartDate}
```

### Document Schemas

#### 1. `settings/main`

- `planStartDate`: string (`YYYY-MM-DD`)
- `planLengthDays`: number (default: `90`)
- `floor`:
  - `problems`: number (default: `2`)
  - `revisions`: number (default: `1`)
  - `applications`: number (default: `5`)
  - `requireLog`: boolean (default: `true`)
- `targets`:
  - `problemsPerDay`: number (default: `3`)
  - `applicationsPerDay`: number (default: `5`)
  - `mocksPerWeek`: number (default: `2`)
  - `startupHours`: number (default: `4.5`)
  - `gymHours`: number (default: `2`)
  - `sleepHours`: number (default: `7`)
- `scheduleBlocks`: Array<{ `id`: string, `start`: string, `end`: string, `label`: string, `category`: string }>
- `patternTargets`: Record<string, number> (e.g., `{ "Two Pointers": 15, "Sliding Window": 12 }`)
- `jobFilters`:
  - `includeTitleKeywords`: string[]
  - `excludeTitleKeywords`: string[]
  - `locations`: string[]
  - `preferredLocations`: string[]
  - `allowRemoteIndia`: boolean
  - `maxMinExperienceYears`: number (default: `2`)
  - `minSalaryLPA`: number (default: `5`)
  - `includeUnknownSalary`: boolean (default: `true`)
  - `includeInternships`: boolean (default: `false`)
  - `maxAgeDays`: number (default: `3`)
  - `blockedCompanies`: string[]
  - `skillKeywords`: Array<{ `word`: string, `weight`: number }>
  - `fxRates`: { `USD`: number, `EUR`: number, `GBP`: number } (defaults: `85`, `95`, `110`)
- `apiTokenHash`: string (SHA-256 hex digest)
- `theme`: `"dark"` | `"light"` | `"system"`

#### 2. `dailyLogs/{date}` (document ID: `YYYY-MM-DD`)

- `date`: string (`YYYY-MM-DD`)
- `wakeTime`: string (`HH:mm`)
- `sleepTime`: string (`HH:mm`)
- `sleepHours`: number
- `startupHours`: number
- `gymDone`: boolean
- `gymHours`: number
- `energy`: number (`1` to `5`)
- `win`: string
- `wentWrong`: string
- `tomorrowTop3`: [string, string, string]
- `notes`: string
- `overrides`: { `problems`?: number, `revisions`?: number, `applications`?: number }
- `dueRevisionsAtStart`: number
- `floorMet`: boolean
- `submitted`: boolean
- `submittedAt`: Firestore Timestamp | null
- `checklist`: Record<string, boolean> (mapped by block ID)
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

#### 3. `problems/{id}`

- `title`: string
- `url`: string
- `platform`: `"leetcode"` | `"codeforces"` | `"hackerrank"` | `"gfg"` | `"other"`
- `pattern`: string (e.g. `"Two Pointers"`, `"Binary Search"`, `"Dynamic Programming"`)
- `difficulty`: `"easy"` | `"medium"` | `"hard"`
- `solvedAt`: string (`YYYY-MM-DD`)
- `timeTakenMin`: number
- `outcome`: `"clean"` | `"hinted"` | `"failed"`
- `insight`: string (maximum 200 characters)
- `stuckAt`: string
- `complexity`: { `time`: string, `space`: string }
- `tags`: string[]
- `revision`:
  - `step`: number (`0` to `5`)
  - `nextDue`: string | null (`YYYY-MM-DD`)
  - `history`: Array<{ `date`: string, `result`: `"pass"` | `"fail"`, `fromStep`: number, `toStep`: number }>
  - `mastered`: boolean

#### 4. `mistakes/{id}`

- `date`: string (`YYYY-MM-DD`)
- `text`: string
- `pattern`?: string
- `problemId`?: string
- `reviewedWeeks`: string[] (e.g. `["2026-W42"]`)

#### 5. `mocks/{id}`

- `date`: string (`YYYY-MM-DD`)
- `type`: `"dsa"` | `"lld"` | `"system-design"` | `"behavioral"` | `"full-loop"` | `"hr"`
- `platform`: `"peer"` | `"paid"` | `"ai"` | `"real"`
- `interviewer`?: string
- `durationMin`: number
- `score`: number (`1` to `5`)
- `strengths`: string
- `weaknesses`: string
- `actionItems`: string[]
- `problemTitles`: string[]

#### 6. `applications/{id}`

- `company`: string
- `role`: string
- `url`: string
- `source`: string (e.g., `"referral"`, `"career-page"`, `"scraper"`, `"job-board"`)
- `status`: `"saved"` | `"applied"` | `"oa"` | `"interview"` | `"offer"` | `"rejected"` | `"ghosted"` | `"withdrawn"`
- `appliedDate`: string (`YYYY-MM-DD`)
- `referral`: boolean
- `referrerName`?: string
- `salaryLPA`?: number
- `location`: string
- `followUpDate`?: string (`YYYY-MM-DD`)
- `notes`: string
- `jobId`?: string
- `statusHistory`: Array<{ `status`: string, `date`: string }>
- `createdAt`: Firestore Timestamp

#### 7. `jobs/{jobId}` (Defined in Prompt 6, ingested by Scraper)

- Defined in Prompt 6 (written by scraper)
- `status`: `"new"` | `"saved"` | `"applied"` | `"dismissed"`
- `closed`: boolean

#### 8. `scraperRuns/{runId}`

- `startedAt`: Firestore Timestamp
- `finishedAt`: Firestore Timestamp
- `perSource`: Array<{ `name`: string, `fetched`: number, `kept`: number, `error`?: string }>
- `totalNew`: number
- `ok`: boolean

#### 9. `roadmap/main`

- `weeks`: Array<{ `n`: number, `theme`: string, `goals`: Array<{ `id`: string, `text`: string, `done`: boolean }> }>
- `topics`: Array<{ `id`: string, `group`: string, `text`: string, `status`: `"todo"` | `"doing"` | `"done"` }>

#### 10. `patternNotes/{pattern}`

- `markdown`: string (pattern cheat-sheet)
- `updatedAt`: Firestore Timestamp

#### 11. `weeklyReviews/{weekStartDate}` (document ID: `YYYY-MM-DD` of Monday)

- `weekStart`: string (`YYYY-MM-DD`)
- `whatWorked`: string
- `whatToChange`: string
- `nextFocus`: string
- `createdAt`: Firestore Timestamp

#### Firestore Index Configuration

- All composite indexes must be declared in `firestore.indexes.json` and deployed using the Firebase CLI.

---

## 7. Business Rules (Pure Logic in `packages/shared`)

All business rules must be implemented as pure, side-effect-free functions covered by comprehensive Vitest tests including boundary conditions and edge cases.

### 7.1 Auto-Derived Counters for Date $D$

- `problems`: count of `problems` where `solvedAt == D`.
- `revisions`: count of `revision.history` entries where `date == D`.
- `applications`: count of `applications` where `appliedDate == D`.
- `mocks`: count of `mocks` where `date == D`.
- **Override behavior:** A daily log entry for date $D$ may explicitly override `problems`, `revisions`, or `applications`. If specified in `overrides`, the override value takes precedence.

### 7.2 Daily Floor Completion Check (`floorMet(D)`)

`floorMet(D)` returns `true` if and only if all of the following conditions evaluate to true:

1. `problems >= floor.problems`
2. `(revisions >= floor.revisions) || (dueRevisionsAtStart == 0)`
3. `applications >= floor.applications`
4. `(submitted == true) || (floor.requireLog == false)`

### 7.3 Streak Engine

- Evaluates consecutive dates ending at `todayIST()` where `floorMet(date) == true`.
- If today's floor is not yet met, count backward from yesterday (`today - 1`) and flag today as **`atRisk: true`** (streak is active but endangered; not broken).
- A missed floor on any past date prior to today strictly breaks the streak.
- Streak state return signature:
  ```typescript
  interface StreakResult {
    currentStreak: number;
    longestStreak: number;
    totalFloorDays: number;
    atRisk: boolean;
  }
  ```

### 7.4 Spaced Repetition Revision Engine

- **Interval Table (in days):** `[1, 3, 7, 14, 30]` (steps 0 through 4; step 5 represents mastery).
- **New Problem Solved:**
  - If `outcome === "clean"` AND `timeTakenMin <= 25`: Fast-track to **Step 2** with `nextDue = solvedAt + 7 days`.
  - Otherwise: Initialize at **Step 0** with `nextDue = solvedAt + 1 day`.
- **Pass Progression:**
  - Passing step $s$ advances problem to step $s+1$ with `nextDue = reviewDate + intervals[s+1]`.
  - Passing the final step (30-day interval) marks the problem as `mastered = true` and `nextDue = null`.
- **Failure Demotion:**
  - Failing at any step resets the problem to **Step 0** with `nextDue = tomorrow` (`reviewDate + 1 day`).
- **Overdue Handling:**
  - Overdue items remain permanently due with zero penalty; sorted oldest-first.
- **Idempotency:**
  - Completing revision for the same problem multiple times on the same date is ignored.

### 7.5 Pattern Coverage Calculation

- For each algorithm pattern, computes solved problem count versus configured target (`patternTargets[pattern]`).
- Calculates percentage coverage and flags under-represented patterns.

### 7.6 Salary Normalization to LPA (INR Lakh Per Annum)

- **Monthly INR:** `(monthly * 12) / 100,000`
- **Annual INR:** `annual / 100,000`
- **Foreign Currencies (USD, EUR, GBP):**
  - Convert to INR using `fxRates` (defaults: `USD = 85`, `EUR = 95`, `GBP = 110`).
  - Calculate `(foreignAmount * fxRate) / 100,000`.
  - Flag field as `estimated = true`.

---

## 8. Web Routes Architecture

| Route        | View Purpose                                                                                    |
| :----------- | :---------------------------------------------------------------------------------------------- |
| `/`          | Bento Grid Command Center Dashboard (KPIs, streak flame, habits, due revisions, daily progress) |
| `/log`       | Rapid daily logging interface (< 60s entry workflow, block checklist, overrides, reflection)    |
| `/dsa`       | LeetCode / DSA problem tracker, pattern categorization, difficulty, insights, time metrics      |
| `/revision`  | Spaced repetition revision queue, due cards, pass/fail review actions                           |
| `/mistakes`  | Mistakes and anti-patterns notebook, weekly review tagging                                      |
| `/jobs`      | Scraped job feed, filtering, title/keyword ranking, quick-save, dismiss                         |
| `/pipeline`  | Job applications Kanban board (`saved`, `applied`, `oa`, `interview`, `offer`, etc.)            |
| `/mocks`     | Mock interview tracker, scoring, feedback recording, action items                               |
| `/roadmap`   | 90-day structured roadmap, weekly milestone themes, syllabus checklist                          |
| `/review`    | Weekly retrospectives (`whatWorked`, `whatToChange`, `nextFocus`)                               |
| `/extension` | Chrome Extension setup guide, download links, and personal API token generation/revocation      |
| `/settings`  | Global configurations: floor targets, daily schedules, job filters, demo data management        |
| `/login`     | Authentication portal (Google Sign-In, unauthorized email block)                                |

---

## 9. Engineering Rules

1. **Strict TypeScript & Zod Validation:** TypeScript strict mode enabled with zero tolerance for `any`. Validate all untrusted external data boundaries using Zod: Firestore reads, Next.js API route bodies, scraper inputs, and extension payloads.
2. **Logic Isolation in Shared Package:** All business rules, calculations, and domain logic must live exclusively in `packages/shared` backed by automated tests. React UI components must contain zero domain business rules.
3. **Comprehensive UI States & Optimistic UX:** Every page, bento card, and list component must explicitly handle `loading`, `empty`, and `error` states. Mutations must be optimistic where safe and display clear toast notifications on failure.
4. **Design Token Discipline:** Hardcoded colors outside of defined Tailwind theme tokens are strictly forbidden.
5. **Atomic Conventional Commits & Quality Gates:** Follow conventional commits (`feat:`, `fix:`, `chore:`). Before declaring any task or prompt complete, execute `lint`, `typecheck`, `test`, and `build`, and resolve all issues.
6. **Dependency Governance:** Seek user authorization before introducing any dependency outside the approved stack; log every approved addition in [`docs/DECISIONS.md`](file:///home/sanjay/Desktop/docs/DECISIONS.md).
7. **Zero Speculation on APIs:** Never invent API endpoints or payload response structures. Verify against official documentation or live requests, citing references in code comments.
8. **Explicit Cloud & Secret Handling:** When an operation requires an API secret, service account, or cloud console step, halt and provide clear manual instructions. Never mock or stub production cloud paths.
9. **Controlled Demo Data:** Demo data must never leak into production workflows. Demo datasets exist strictly behind explicit `"Load demo data"` and `"Clear demo data"` actions in `/settings`.
