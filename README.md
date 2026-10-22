# Codex Exilis

A React single-page archive of an original science-fiction and dark-fantasy universe. Browse 120 dossiers, combine filters, read full histories, save favourites, and add your own entities.

**Delivery status:** source files and a production build are included. This edition has not been deployed and no GitHub repository has been created. The course's mandatory public deployment and repository submission remain separate steps.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended).

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The app needs no credentials, environment variables or backend service.

```bash
npm test
npm run build
npm run preview
```

`dist/` contains the ready-to-host production build. Serve it over HTTP; opening `index.html` directly through `file://` does not support module loading or reliable browser storage.

## Features

- 120 initial records: 24 of each entity type, with unique IDs and names.
- Search across name, origin, type and full history. Multiple words use AND matching.
- Combine classification, threat, status and maximum-clearance filters.
- Sort by name, semantic threat order, or numeric clearance in either direction.
- Pages of 12, 24 or 48 entries; filtering and sorting happen before pagination.
- Shareable hash-based detail routes such as `#/entity/EX-0001`.
- Controlled intake form, field-level validation, duplicate-name protection, cancellation and explicit success feedback.
- Persistent saved collection, independent of the entity data.
- Loading skeletons, actionable errors with retry, empty states and image fallbacks.
- Responsive SCSS, keyboard navigation, accessible modal focus management and reduced-motion support.

## Architecture

```text
src/
  api/codexApi.js          Promise-based storage boundary
  components/             Header, Hero, FilterBar, ItemList, ItemCard,
                          ItemDetail, AddItemForm, Pagination and shared UI
  data/records.json       All 120 initial records, stored explicitly
  domain/records.js       Enumerations, validation, pure query pipeline
  hooks/                  Async resource, debounce and hash navigation
  styles/                 Tokens, base styles and feature SCSS modules
  test/                   Query, API, async lifecycle and form tests
  App.jsx                 Shared query state, routing and mutation coordination
  main.jsx                React mount and StrictMode
public/
  images/                 Bundled photography; no remote image request needed
  sigil.svg               Original vector mark
docs/
  DEFENSE_RU.md            Code walkthrough and defence preparation
  QA.md                   Verification record and manual test scenarios
```

`App` owns state that several screens need: filters, pagination, saved IDs and notifications. Form drafts and validation belong to `AddItemForm`; request lifecycles belong to `useAsyncResource`. Presentation components receive values and callbacks through props.

The app has one record source: `codexApi`. UI components never access localStorage directly. `list`, `get`, `create` and `toggleSaved` all return delayed Promises. Initial data is seeded on the first record read. Later reads preserve user additions.

Storage keys:

| Key                       | Contents                                   |
| ------------------------- | ------------------------------------------ |
| `codex-exilis:archive:v1` | Array of initial and user-created entities |
| `codex-exilis:saved:v1`   | Array of bookmarked entity IDs             |

This is a browser-local simulation: records are not shared between visitors or devices. Clearing site data removes user additions. Storage events refresh another open tab, but simultaneous writes in separate tabs are last-write-wins; this is not a multi-user database.

## Async correctness

Search waits 250 ms after typing. The list loader depends on every query parameter and a refresh revision. Each effect owns an AbortController. Cleanup aborts the simulated delay; completion handlers also inspect the signal so an obsolete result cannot replace a newer query. Retry increments a local revision and starts a fresh request.

The list is a derived result, not a second editable copy of records. Sorting operates on the array returned by filtering and does not mutate seed data. A deterministic ID tie-breaker keeps equal sort values stable. Query changes reset the page in the same state update; the API also clamps invalid page numbers.

`key={item.id}` preserves each card's identity across sorting. `key={route.id}` resets detail state between dossiers. The form unmounts on close and starts a new draft when reopened. Cancelling the form aborts a pending write before it commits.

The only DOM query is the required React root lookup in `main.jsx`. Application rendering and updates are declarative. A ref restores focus to the intake button after the accessible Radix dialog closes.

## Deployment

The app works on static hosting. `base: './'` keeps bundled asset paths relative, and hash navigation avoids server-side route rewrites.

### Netlify or Vercel

1. Push the project source to a GitHub repository; omit `node_modules` and `dist`.
2. Import the repository in the hosting dashboard.
3. Select Vite, with build command `npm run build` and output directory `dist`.
4. Use Node.js 22.12+ or 24 and publish.
5. Test the public URL in a fresh browser: search, open a dossier, create a record, reload, and verify persistence.

You can also upload the included `dist` folder to a static host that supports direct folder deployment. For GitHub Pages, publish `dist` through a Pages workflow; no router fallback is required.

Submit the real repository link and the tested public deployment link. A localhost URL does not meet the deployment criterion.

## Error recovery

Storage failures do not silently discard records. If storage is full or disabled, correct the browser setting or free space, then use **Retry connection**. If stored JSON is corrupt, export/copy it before making changes and restore a valid record array. Use a separate browser profile for destructive testing of site data.

## Assets and dependencies

All lore is original fictional content. Photography from Unsplash is bundled locally as illustrative imagery; it does not depict the fictional entities literally.

| Local asset              | Source                                                       |
| ------------------------ | ------------------------------------------------------------ |
| `hero.jpg`, `nebula.jpg` | https://images.unsplash.com/photo-1462331940025-496dfbfc7564 |
| `planet.jpg`             | https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4 |
| `orbit.jpg`              | https://images.unsplash.com/photo-1446776811953-b23d57bd21aa |
| `eclipse.jpg`            | https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5 |
| `ruins.jpg`              | https://images.unsplash.com/photo-1518709268805-4e9042af9f23 |

See the [Unsplash license](https://unsplash.com/license). Icons use [Lucide](https://lucide.dev/license). The intake modal uses [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog). Core references: [React effects](https://react.dev/reference/react/useEffect), [Vite](https://vite.dev/guide/), and [Sass](https://sass-lang.com/documentation/).

Exact dependency versions are recorded in `package-lock.json`. Use `npm ci` for reproducible installation.
