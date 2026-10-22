# Verification record

Verified on 21 October 2026.

## Automated checks

Production bundle built successfully with Vite 8.3.5. The React application, SCSS and bundled image assets are included in `dist/`.

**22 tests passed across four test files.**

- Seed count, unique identifiers, schema and all five classifications.
- Multi-word search across names, origins and histories.
- Combined type, threat, status and clearance filters.
- Semantic threat ordering, alphabetical and numeric sorts.
- Pagination after sorting, page clamping and empty results.
- Immutable source data and saved-ID filtering.
- URL and field validation.
- First-read seeding, record creation and storage persistence.
- Cancellation before writes, duplicate names and quota failures.
- Corrupted storage preserved without automatic reset.
- Bookmark toggling and saved-only API queries.
- Stale asynchronous completions ignored after a newer request.
- Error recovery by retry and abort on unmount.
- Controlled form validation and draft preservation after API failure.

The restricted Windows verification environment blocks Vite's optional `net use` mapped-drive probe. The verification harness skipped that discovery call and ran Vitest with a thread pool. Application source and dependency files were not patched to bypass it. Normal installations use the standard package scripts.

## Browser checks

The production build was served over HTTP and returned status 200. Browser verification covered:

- Successful initial load and all 120 initial records.
- Loading skeleton and empty-search recovery.
- Planet + Omega filtering with name sorting: six matching results in alphabetical order.
- Page 2 displaying entries 13–24.
- Invalid form submission with field-level feedback.
- Creating a spacecraft dossier and opening its detail route.
- Record and bookmark persistence after a full reload.
- Saved-only view and removing its last bookmark into the empty state.
- Modal dismissal with Escape, focus restoration and an empty draft on reopening.
- Desktop layout at 1440 px and mobile layout/form at 390 px.
- Browser console: no errors or warnings during the exercised flows.

Storage corruption and quota-failure paths were verified in automated tests rather than by damaging browser data. Other browsers, real multi-device synchronization, and public hosting have not been verified. Deployment is intentionally deferred for this file-only delivery.

## Before submission

1. Run `npm ci`, `npm test` and `npm run build` on the submission machine.
2. Publish the repository and deploy `dist` using the README instructions.
3. Open the public deployment in a fresh browser.
4. Add one dossier, reload, search for it and open its detail URL directly.
5. Check a narrow screen and keyboard-only navigation.
6. Submit both the actual GitHub repository link and the working public URL.
