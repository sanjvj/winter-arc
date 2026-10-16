# Project Rules: Winter Arc Command Center

This file defines the mandatory workspace and engineering rules for the **Winter Arc Command Center** project. All AI assistants, agents, and contributors must strictly adhere to these rules when working within this workspace.

---

## Engineering Rules (Section 9)

1. **Strict TypeScript & Boundary Validation:**
   - Strict mode is mandatory across all packages and apps (`"strict": true` in `tsconfig.json`).
   - No usage of `any` is permitted under any circumstances (use `unknown` with narrowing or explicit typing).
   - Validate all external data at system boundaries using **Zod**:
     - Firestore reads and writes at boundary layers.
     - Next.js API route bodies, parameters, and query strings.
     - Scraper raw inputs and parsed HTML structures.
     - Chrome extension messages and payload transfers.

2. **Domain Logic Isolation:**
   - All domain calculations, business logic, counters, streak logic, and revision engines must live exclusively in `packages/shared`.
   - All shared logic must be accompanied by comprehensive Vitest tests covering standard flows, boundaries, and edge cases.
   - UI components (`/apps/web`, `/apps/extension`) must remain strictly presentational and contain zero business rules.

3. **Complete UI States & Optimistic Interactions:**
   - Every view, bento grid card, modal, and data list must explicitly implement:
     - A clean **loading skeleton** state.
     - A meaningful **empty** state.
     - A descriptive **error** fallback state.
   - Mutations must be optimistic where safe to perform, and must toast immediately on failure with clear user recovery actions.

4. **Zero Hardcoded Colors:**
   - Hardcoded hex, rgb, or arbitrary Tailwind values (`bg-[#...]`) are strictly forbidden outside of the design token declarations.
   - All styling must strictly utilize the semantic "Winter Arc" design tokens configured in Tailwind CSS.

5. **Conventional Commits & Quality Verification:**
   - Use conventional commit messages (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
   - Before declaring any task, feature, or prompt complete, always run the full verification suite:
     - `pnpm lint`
     - `pnpm typecheck`
     - `pnpm test`
     - `pnpm build`
   - Fix all warnings and errors before handoff.

6. **Dependency Governance:**
   - Never add a dependency outside the approved technology stack without explicit user consent.
   - Every deviation or addition must be formally recorded in [`docs/DECISIONS.md`](file:///home/sanjay/Desktop/docs/DECISIONS.md) with date, rationale, and alternatives considered.

7. **Zero Speculation on External APIs:**
   - Never hallucinate or assume external API endpoints, response payloads, or library schemas.
   - Always verify against official documentation or live HTTP requests, and cite the documentation URL or source in code comments.

8. **Strict Handling of Secrets & Cloud Setup:**
   - Whenever an operation requires a cloud service account, private key, OAuth secret, or manual configuration step, pause and instruct the user with exact manual steps.
   - Never bypass or fake cloud production paths with mock data in production builds or route handlers.

9. **Demo Data Isolation:**
   - Demo data must never leak into production code paths or real user collections.
   - Demo fixtures exist solely behind explicit, user-triggered `"Load demo data"` and `"Clear demo data"` buttons located in `/settings`.

---

## References

- Full Specification: [`docs/SPEC.md`](file:///home/sanjay/Desktop/docs/SPEC.md)
- Decision Log: [`docs/DECISIONS.md`](file:///home/sanjay/Desktop/docs/DECISIONS.md)
- Implementation Progress: [`docs/PROGRESS.md`](file:///home/sanjay/Desktop/docs/PROGRESS.md)
