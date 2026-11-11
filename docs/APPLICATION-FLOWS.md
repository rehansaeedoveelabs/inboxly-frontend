# Frontend application flows

Flows describe what the SPA does today and which API calls it makes. Backend-only behavior is summarized; see the backend [APPLICATION-FLOWS.md](https://github.com/rehansaeedoveelabs/inboxly-backend/blob/feature/phase-2-audience/docs/APPLICATION-FLOWS.md) for server internals.

## Login and registration

**UI:** `pages/auth/LoginPage.jsx`, `RegisterPage.jsx`  
**API:** `auth/authApi.js` → `POST /api/v1/auth/login|register`, then session via cookies

1. Guest opens `/login` or `/register`.
2. Submit → `apiFetch` ensures CSRF cookie, posts credentials (`credentials: 'include'`).
3. On success, `AuthProvider` stores user; router sends user to `state.from` or `/`.
4. Boot path: `GET /api/v1/auth/me` restores session; failure → guest.
5. Sign out from header → `POST /api/v1/auth/logout` → clear auth state.

**Not built in SPA:** forgot/reset password pages, email-verified landing (backend may redirect to `/email-verified`, which currently falls through to `/`).

## Workspace / store selection

**UI:** Header store switcher + `pages/settings/StoreSettingsPage.jsx`  
**Context:** `store/WorkspaceStoresProvider.jsx`  
**API:** `lib/storesApi.js`

1. After auth, provider loads stores for `workspaces[0]`.
2. User creates a pending Shopify store (name + `*.myshopify.com` domain) → `POST /workspaces/{id}/stores`.
3. Selecting a store → `POST /stores/{id}/activate` → refresh user + stores.
4. Demo stores are hidden from the switcher.

**Limitation:** no workspace switcher; secondary workspaces are ignored.

## Shopify connection

**UI:** `pages/settings/StorefrontIntegrationPage.jsx`  
**API helpers:** `lib/shopifyOAuth.js`, `storesApi.disconnectShopifyStore`

1. **Connect / Reconnect:** resolve real store ULID → `window.location.assign('/api/v1/stores/{id}/shopify/oauth/start')` (full navigation through Vite proxy).
2. Backend completes OAuth and redirects to `/settings/storefront?shopify=connected|error&reason=...`.
3. Page reads query params and shows banners; refreshes stores.
4. **Disconnect:** confirm → `DELETE /api/v1/stores/{id}/shopify/connection` → show `meta.remote_revoked` messaging.

**Mock on the same page:** embed/tracking/popup “health” rows and local simulate/reset controls from `getStorefrontIntegration()` — not backend data.

## Audience contact management

**UI:** `ContactsPage.jsx`, `ContactDetailPage.jsx`  
**API:** `lib/contactsApi.js`

1. Requires an active store; otherwise empty state.
2. List: cursor pagination, filters (`q`, tag, consent) → `GET /stores/{store}/contacts`.
3. Create / update / soft-delete via contact endpoints.
4. Soft-delete identity conflict → `ContactDeletedConflictError` (HTTP 409) with restore option.
5. Detail: consents (`PUT .../consents`), consent review (`POST .../consent-review`), tag attach/detach.

## Contact imports

**UI:** `ImportsPage.jsx`  
**Client parse:** `lib/csvImport.js`  
**API:** `lib/importsApi.js`

1. User pastes/parses CSV in the browser (not multipart upload to S3).
2. `POST /stores/{store}/contact-imports` with JSON `rows` (+ tags).
3. Poll `GET /contact-imports/{id}` until terminal status.
4. History kept in **sessionStorage** only (backend has no list endpoint).

## Consent review and restoration

Handled on contact detail / create conflict paths:

- Restore → `POST /contacts/{id}/restore`
- Clear review gate → `POST /contacts/{id}/consent-review`

Backend preserves consent statuses on restore; review only clears `consent_review_required_at`.

## Segments

**UI:** `SegmentsPage.jsx`  
**API:** `lib/segmentsApi.js`

CRUD against `/stores/{store}/segments` and `/segments/{id}`, plus `POST /segments/{id}/preview` for count + sample.

## Exports

**UI:** `pages/audience/ExportsPage.jsx`  
**API:** `lib/exportsApi.js`

1. Start export with optional `q`, `tag`, `consent_email` filters → `POST /stores/{store}/contact-exports` (202).
2. List history with keyset cursor pagination → `GET /stores/{store}/contact-exports`.
3. Poll pending/processing rows → `GET /contact-exports/{id}` until terminal status.
4. Download completed CSV as a credentialed blob → `GET /contact-exports/{id}/download` (handles 409/410/404).
5. Resource never includes storage paths; UI relies on `download_available`.

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [ROADMAP-AND-GAPS.md](ROADMAP-AND-GAPS.md)
