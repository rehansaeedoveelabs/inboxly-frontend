import { useState } from 'react'
import { Cable, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
} from '../../components/ui'
import { findActiveBackendStoreId, userHasWorkspace } from '../../auth/backendStore'
import { useAuth } from '../../auth/useAuth'
import { getStorefrontIntegration } from '../../mock'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { ApiError } from '../../lib/api'
import { startShopifyOAuth } from '../../lib/shopifyOAuth'
import { useActiveStore } from '../../store/useActiveStore'

function StatusRow({ label, value, ok, detail }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-midnight px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {detail ? <p className="mt-0.5 text-xs text-muted">{detail}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {ok ? (
          <CheckCircle2 className="size-4 text-success" aria-hidden />
        ) : (
          <XCircle className="size-4 text-danger" aria-hidden />
        )}
        <Badge tone={ok ? 'success' : 'danger'}>{value}</Badge>
      </div>
    </div>
  )
}

export function StorefrontIntegrationPage() {
  const initial = getStorefrontIntegration()
  const [integration, setIntegration] = useState(initial)
  const [checking, setChecking] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const { activeStore } = useActiveStore()
  const { user, isAuthenticated } = useAuth()

  const backendStoreId = findActiveBackendStoreId(user)
  const hasWorkspace = userHasWorkspace(user)
  const canStartOAuth = isAuthenticated && hasWorkspace

  const embedOk = integration.appEmbedEnabled
  const trackingOk = integration.storefrontTracking === 'active'
  const formsOk = integration.signupFormsStatus === 'active'
  const popupOk = integration.popupStatus === 'active'

  const simulateEnable = () => {
    setChecking(true)
    window.setTimeout(() => {
      setIntegration((value) => ({
        ...value,
        appEmbedEnabled: true,
        storefrontTracking: 'active',
        signupFormsStatus: 'active',
        popupStatus: 'active',
        lastCheckedAt: new Date().toISOString(),
      }))
      setChecking(false)
    }, 900)
  }

  const simulateDisable = () => {
    setIntegration(initial)
  }

  const connectShopify = async () => {
    if (!canStartOAuth) return
    setConnectError('')
    setConnecting(true)
    try {
      await startShopifyOAuth({
        selectedDomain: activeStore?.domain ?? null,
      })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Network error while starting Shopify connection.'
      setConnectError(message)
      setConnecting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Storefront integration"
        description="Connect Shopify through Inboxly OAuth, then enable the App Embed in the theme editor."
        actions={<Badge tone="accent">Shopify OAuth</Badge>}
      />

      <Card className="mb-4 space-y-3">
        {canStartOAuth ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Connect Shopify</h3>
              <p className="mt-1 text-xs text-muted">
                Uses your signed-in Inboxly session
                {backendStoreId ? (
                  <>
                    {' '}
                    and backend store <span className="font-mono text-ink">{backendStoreId}</span>
                  </>
                ) : (
                  <>
                    . Inboxly will resolve a real store ULID from your workspace — the mock
                    storefront selector is never used as a store ID
                  </>
                )}
                . You will leave Inboxly to approve access in Shopify; connection is confirmed
                only after Shopify redirects back.
              </p>
            </div>
            <Button onClick={connectShopify} disabled={connecting}>
              <Cable className="size-4" />
              {connecting ? 'Redirecting to Shopify…' : 'Connect Shopify'}
            </Button>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-ink">Shopify OAuth unavailable</h3>
            <p className="mt-1 text-xs text-muted">
              {!isAuthenticated
                ? 'Sign in to Inboxly before connecting Shopify.'
                : 'Your account has no workspace yet. Create a workspace and store on the backend before connecting Shopify — mock storefronts are not used for OAuth.'}
            </p>
          </div>
        )}
        {connectError ? (
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {connectError}
          </div>
        ) : null}
      </Card>

      {!embedOk ? (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-ink">
                App embed is switched off in the demo theme
              </p>
              <p className="text-xs text-muted">
                After OAuth, turn on the Inboxly App Embed in the Shopify Theme Editor for tracking
                and forms.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                window.open(integration.themeEditorUrl, '_blank', 'noopener,noreferrer')
                simulateEnable()
              }}
            >
              Enable in Shopify Theme Editor
              <ExternalLink className="size-3.5" />
            </Button>
            <Button size="sm" variant="secondary" onClick={simulateEnable}>
              Mark as done (mock)
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-ink">
          App embed looks enabled in this prototype. Tracking and forms are marked active locally.
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Connection health</h3>
            <p className="text-xs text-muted">
              Checked {formatDateTime(integration.lastCheckedAt)}
            </p>
          </div>

          <StatusRow
            label="Store connection"
            value={integration.storeConnected ? 'Connected' : 'Disconnected'}
            ok={integration.storeConnected}
            detail={integration.themeName}
          />
          <StatusRow
            label="App embed"
            value={embedOk ? 'Enabled' : 'Disabled'}
            ok={embedOk}
            detail="Inboxly App Embed toggle in theme editor"
          />
          <StatusRow
            label="Storefront tracking"
            value={trackingOk ? 'Active' : 'Inactive'}
            ok={trackingOk}
            detail="Page views, carts and checkout events"
          />
          <StatusRow
            label="Signup forms"
            value={formsOk ? 'Active' : 'Blocked by embed'}
            ok={formsOk}
            detail="Embedded forms require app embed"
          />
          <StatusRow
            label="Popup forms"
            value={popupOk ? 'Active' : 'Blocked by embed'}
            ok={popupOk}
            detail="Popups require app embed"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={() => {
                window.open(integration.themeEditorUrl, '_blank', 'noopener,noreferrer')
                if (!embedOk) simulateEnable()
              }}
            >
              <Cable className="size-4" />
              Enable in Shopify Theme Editor
            </Button>
            <Button variant="secondary" disabled={checking} onClick={simulateEnable}>
              {checking ? 'Checking…' : 'Simulate embed enabled'}
            </Button>
            <Button variant="ghost" onClick={simulateDisable}>
              Reset mock status
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">What merchants will enable</h3>
          <div
            className={cn(
              'rounded-lg border p-4',
              embedOk ? 'border-success/40 bg-success/10' : 'border-line bg-midnight',
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Inboxly App embed</p>
              <Badge tone={embedOk ? 'success' : 'warning'}>
                {embedOk ? 'On' : 'Off'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border border-line bg-elevated px-3 py-3">
              <span className="text-sm text-muted">Theme editor toggle</span>
              <button
                type="button"
                role="switch"
                aria-checked={embedOk}
                aria-label="App embed mock toggle"
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  embedOk ? 'bg-electric' : 'bg-secondary',
                )}
                onClick={() => (embedOk ? simulateDisable() : simulateEnable())}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 size-5 rounded-full bg-ink transition-transform',
                    embedOk && 'translate-x-5',
                  )}
                />
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Don&apos;t forget to click <strong className="text-ink">Save</strong> in the Shopify
              theme editor after enabling App Embed. This screen only simulates that future flow.
            </p>
          </div>

          <p className="mt-4 text-xs text-muted">{integration.notes}</p>
        </Card>
      </div>
    </div>
  )
}
