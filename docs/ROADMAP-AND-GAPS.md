# Frontend roadmap and gaps

Status of UI modules relative to the live Laravel API. Do not treat mock screens as product features.

## Fully integrated modules

| Module | Primary files | Backend |
|--------|---------------|---------|
| Login / register / logout / session restore | `auth/*`, `pages/auth/*` | Auth routes |
| Store list / create / activate | `WorkspaceStoresProvider`, `StoreSettingsPage`, `storesApi.js` | Stores + activate |
| Shopify connect / reconnect / disconnect | `StorefrontIntegrationPage`, `shopifyOAuth.js` | OAuth + disconnect |
| Contacts list + detail | `ContactsPage`, `ContactDetailPage`, `contactsApi.js` | Contacts, consents, tags, restore, review |
| Tags | `TagsPage`, `tagsApi.js` | Tags CRUD |
| Segments + preview | `SegmentsPage`, `segmentsApi.js` | Segments + preview |
| Imports (JSON rows) | `ImportsPage`, `importsApi.js`, `csvImport.js` | Contact imports |
| Exports (create / poll / download) | `ExportsPage`, `exportsApi.js` | Contact exports |

## Partially integrated modules

| Module | What works | What does not |
|--------|------------|---------------|
| Storefront settings | Live OAuth + disconnect | Embed/tracking health is **mock** |
| Imports | Live job + poll | No server-side history; sessionStorage only; no file upload API |
| Header / shell | Live store switcher + auth menu | Notifications popover still prototype copy |
| Multi-workspace | User payload may include many workspaces | UI uses `workspaces[0]` only |

## Mock UI modules

These routes are reachable from the nav but read `src/mock/*` (or local-only state). They are **not** wired to Inboxly domain APIs:

- Dashboard (`DashboardPage.jsx`)
- Campaigns (list / wizard / detail)
- Automation (list / templates / editor)
- Forms (list / editor)
- Insights (analytics / live)
- Resources (image library / brand assets)
- Channel settings
- Account settings (explicitly “not saved to a backend”; theme switcher is local)

`README.md` previously called the whole app a “frontend-only prototype”; that is **outdated** for Audience/Auth/Stores/Shopify, but still accurate for the modules above.

## Missing UI (backend may already exist)

| Capability | Backend | Frontend |
|------------|---------|----------|
| Workspace members list | `GET .../members` | Missing |
| Invitations | Create + email only; **no accept API** | Missing pages |
| Password forgot/reset | Implemented | Missing pages |
| Email verification landing | Redirect target | Missing route |
| Profile / password update | `PUT auth/profile`, `PUT auth/password` | Missing (account page mock) |
| Workspace switcher / create workspace UX | Create workspace API exists | Not exposed in shell |

## Backend / frontend integration gaps

1. **Invitations:** email links to `/accept-invitation` with **no** SPA route and **no** accept API.
2. **Email verified / reset password URLs** from backend mail redirects lack matching routes.
3. **No global 401 handler** — expired sessions surface as per-page errors.
4. **Lint-only quality gate** — `*.test.js` files exist but `package.json` has no `test` script.
5. Production assumes same-site or reverse-proxy cookie sharing; deploy topology is not defined in this repo.

## Future implementation requirements (when building next)

1. Add members/invites UI **after** backend accept-invitation exists.
2. Replace mock marketing modules only when corresponding APIs exist — do not fake success against mocks in production builds.
3. Add workspace switcher if multi-tenant UX is required.
4. Add `npm test` (or remove orphan unit files) for CI clarity.
5. Keep docs in sync when a mock page becomes live.

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [APPLICATION-FLOWS.md](APPLICATION-FLOWS.md)
- Backend gaps: [ROADMAP-AND-GAPS.md](https://github.com/rehansaeedoveelabs/inboxly-backend/blob/feature/phase-2-audience/docs/ROADMAP-AND-GAPS.md)
