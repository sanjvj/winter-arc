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
