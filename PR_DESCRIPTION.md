Title: fix(audit): fix CI pipeline and missing tests — CI/Utils

Body:
## 🛠️ Fixes Implemented

This PR addresses issues found during the automated security & quality audit.

### P4: CI Pipeline Improvements
- **Issue**: CI was too permissive (linting errors ignored) and lacked performance monitoring.
- **Fix**: 
  - Removed `continue-on-error: true` from ESLint job.
  - Added Lighthouse CI job for performance auditing.
  - Added `.github/lighthouserc.json` configuration.
- **Verification**: CI will now fail on lint errors and report Lighthouse scores.

### P5: Missing Unit Tests
- **Issue**: `src/utils/errorHandler.ts` lacked test coverage.
- **Fix**: Added `src/utils/__tests__/errorHandler.test.ts`.
- **Verification**: Run `npm test` (requires vitest).

## 🔒 Security Checks
- [x] P1: Secrets check (Verified clean)
- [x] P2: RLS check (Verified clean)
- [x] P3: Webhook signature check (Verified clean)

## 🧪 How to Test
1. Run `npm run lint` -> Should pass without errors.
2. Run `npm test` -> Should run the new `errorHandler` tests.
3. Check GitHub Actions logs for Lighthouse report.
