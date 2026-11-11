# Inboxly Frontend

React SPA for **Inboxly**, a workspace-based Shopify marketing SaaS.

This repository is the browser UI. It talks to the Laravel API over Sanctum **cookie** authentication. It does **not** embed Laravel code and must not store API bearer tokens in `localStorage`.

**Backend (separate repository):** [inboxly-backend](https://github.com/rehansaeedoveelabs/inboxly-backend)

## Responsibilities

- Login / register session UX and route guards
- Workspace store list, creation, and active-store selection
- Shopify connect / reconnect / disconnect UI (OAuth redirect to API)
- Audience UI: contacts, tags, segments, imports, exports (wired to live APIs)
- Shell navigation for future marketing modules (many pages are still mock)

## Technology stack

Verified from `package.json`:

| Package | Version range |
|---------|----------------|
| React / React DOM | `^19.3.1` |
| Vite | `^8.3.6` |
| react-router-dom | `^7.18.5` |
| Tailwind CSS | `^4.3.5` (`@tailwindcss/vite`) |
| recharts | `^3.10.1` |
| lucide-react | `^1.71.0` |
| oxlint | `^1.90.0` (lint) |

Source is **JavaScript/JSX** (not TypeScript). There is no React Query, Redux, or Zustand.

## Application entry and routing

- Entry: `index.html` → `src/main.jsx` → `ThemeProvider` → `BrowserRouter` → `AuthProvider` → `App` → `AppRoutes` (`src/routes.jsx`)
- Public: `/login`, `/register` (`GuestRoute`)
- Protected: `/` shell (`ProtectedRoute` → `AppShell`) with audience, settings, and mock marketing routes

## Authentication and session

- `src/auth/AuthProvider.jsx` loads `GET /api/v1/auth/me` on boot
- `src/auth/authApi.js` + `src/lib/api.js` (`ensureCsrfCookie`, `X-XSRF-TOKEN`, `credentials: 'include'`)
- Guards: `ProtectedRoute`, `GuestRoute`

## Workspace and store context

- `src/store/WorkspaceStoresProvider.jsx` (mounted in `AppShell`)
- Uses the **first** workspace from `user.workspaces` (`getPrimaryWorkspace` in `src/auth/backendStore.js`)
- Lists stores, filters out demos, activates via `POST /api/v1/stores/{id}/activate`

## API communication

- Relative URLs (`/api/v1/...`, `/sanctum/...`)
- Dev proxy in `vite.config.js` → Laravel at `http://127.0.0.1:8000`
- Service modules: `src/lib/contactsApi.js`, `tagsApi.js`, `segmentsApi.js`, `importsApi.js`, `exportsApi.js`, `storesApi.js`, `shopifyOAuth.js`

## Module status (summary)

| Module | Status |
|--------|--------|
| Auth, stores, Shopify connect UI | **Implemented** (live API) |
| Contacts, tags, segments, imports, exports | **Implemented** (live API) |
| Dashboard, campaigns, automation, forms, insights, resources, account/channels | **Mock** (`src/mock/*`) |
| Members / invitations / password reset / email-verified pages | **Missing** |

Details: [docs/ROADMAP-AND-GAPS.md](docs/ROADMAP-AND-GAPS.md)

## Local development

Requires the backend running (migrations applied) and CORS/Sanctum domains aligned with `http://localhost:5173`.

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run preview
npm run lint
```

There is **no** `npm test` script. Some `*.test.js` files exist under `src/` but are not wired to a runner in `package.json`.

## Documentation

| Document | Contents |
|----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure, providers, API layer, diagrams |
| [docs/APPLICATION-FLOWS.md](docs/APPLICATION-FLOWS.md) | User-facing flows and API calls |
| [docs/ROADMAP-AND-GAPS.md](docs/ROADMAP-AND-GAPS.md) | Integrated vs mock vs missing |

Backend deep docs: [inboxly-backend/docs](https://github.com/rehansaeedoveelabs/inboxly-backend/tree/feature/phase-2-audience/docs)
