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
