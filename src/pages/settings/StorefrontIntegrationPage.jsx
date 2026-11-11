import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Cable, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  EmptyState,
  LoadingState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { startShopifyOAuth } from '../../lib/shopifyOAuth'
import { disconnectShopifyStore, storeStatusLabel, storeStatusTone } from '../../lib/storesApi'
import { getStorefrontIntegration } from '../../mock'
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

function canConnectStore(store) {
  if (!store || store.is_demo) return false
  return ['pending', 'disconnected', 'error'].includes(store.connection_status)
}

function canReconnectStore(store) {
  if (!store || store.is_demo) return false
  return Boolean(store.is_connected || store.connection_status === 'connected')
}

export function StorefrontIntegrationPage() {
  const initial = getStorefrontIntegration()
  const [integration, setIntegration] = useState(initial)
  const [checking, setChecking] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [disconnectFlash, setDisconnectFlash] = useState(null)
  const { activeStore, stores, status, workspace, refreshStores } = useActiveStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const oauthFlash = useMemo(() => {
    const shopify = searchParams.get('shopify')
    if (shopify === 'connected') {
      return { tone: 'success', message: 'Shopify connection completed for the selected store.' }
    }
    if (shopify === 'error') {
      const reason = searchParams.get('reason') || 'unknown'
      return {
        tone: 'danger',
        message: `Shopify connection did not complete (${reason}). The store stays unconnected until verification succeeds.`,
      }
    }
    return null
  }, [searchParams])

  const statusFlash = disconnectFlash || oauthFlash

  const storeConnected = Boolean(activeStore?.is_connected)
  const canStartOAuth = canConnectStore(activeStore)
  const canReconnect = canReconnectStore(activeStore)

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

  const connectShopify = async ({ reconnect = false } = {}) => {
    const allowed = reconnect ? canReconnect : canStartOAuth
    if (!allowed || !activeStore?.id) return
    setConnectError('')
    setConnecting(true)
    try {
      await startShopifyOAuth({ storeId: activeStore.id })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : reconnect
            ? 'Network error while starting Shopify reconnection.'
            : 'Network error while starting Shopify connection.'
      setConnectError(message)
      setConnecting(false)
    }
  }

  const disconnectShopify = async () => {
    if (!storeConnected || !activeStore?.id || disconnecting) return
    const shopLabel = activeStore.shopify_shop_domain || activeStore.domain || activeStore.name
    const confirmed = window.confirm(
      [
        `Disconnect Shopify for ${activeStore.name}?`,
        '',
        'This uninstalls Inboxly from the Shopify store and clears the local Inboxly connection.',
        'Inboxly Audience data (contacts, tags, segments) will be preserved.',
        '',
        `Shop: ${shopLabel}`,
      ].join('\n'),
    )
    if (!confirmed) return

    setConnectError('')
    setDisconnectFlash(null)
    setDisconnecting(true)
    try {
      const result = await disconnectShopifyStore(activeStore.id)
      await refreshStores()

      if (result.remote_revoked === true) {
        setDisconnectFlash({
          tone: 'success',
          message:
            'Inboxly was uninstalled from Shopify and the local connection was cleared. Audience data was preserved.',
        })
      } else {
        setDisconnectFlash({
          tone: 'warning',
          message:
            'Inboxly disconnected locally, but Shopify may still show the app as installed. Uninstall Inboxly from Shopify admin if it still appears there. Audience data was preserved.',
        })
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Network error while disconnecting Shopify.'
      setConnectError(message)
      setDisconnectFlash(null)
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Storefront integration"
        description="Connect a real Inboxly store to Shopify through OAuth."
        actions={<Badge tone="accent">Shopify OAuth</Badge>}
      />

      {statusFlash ? (
        <div
          role="status"
          className={cn(
            'mb-3 rounded-md border px-3 py-2 text-sm',
            statusFlash.tone === 'success'
              ? 'border-success/40 bg-success/10 text-success'
              : statusFlash.tone === 'warning'
                ? 'border-cantaloupe/40 bg-cantaloupe/10 text-cantaloupe-ink'
                : 'border-danger/40 bg-danger/10 text-danger',
          )}
        >
          {statusFlash.message}
        </div>
      ) : null}

      <Card className="mb-4 space-y-3">
        {status === 'loading' ? <LoadingState label="Loading stores…" /> : null}

        {status !== 'loading' && stores.length === 0 ? (
          <EmptyState
            title="No real store to connect"
            description="Create a pending store with your *.myshopify.com domain first. Mock storefronts are not used for OAuth."
            actionLabel="Go to Store settings"
            onAction={() => navigate('/settings/store')}
          />
        ) : null}

        {status !== 'loading' && stores.length > 0 && !activeStore ? (
          <p className="text-sm text-muted">Select a real store from the header before connecting.</p>
        ) : null}

        {activeStore ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {storeConnected ? 'Shopify connected' : 'Connect Shopify'}
              </h3>
              <p className="mt-1 text-xs text-muted">
                Store <span className="text-ink">{activeStore.name}</span> ·{' '}
                <span className="font-mono text-ink">{activeStore.domain}</span>
                {workspace?.name ? <> · workspace {workspace.name}</> : null}
              </p>
              <div className="mt-2">
                <Badge tone={storeStatusTone(activeStore.connection_status)}>
                  {storeStatusLabel(activeStore.connection_status)}
                </Badge>
              </div>
            </div>
            {canStartOAuth ? (
              <Button onClick={() => connectShopify()} disabled={connecting || disconnecting}>
                <Cable className="size-4" />
                {connecting ? 'Redirecting to Shopify…' : 'Connect Shopify'}
              </Button>
            ) : canReconnect ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Connected</Badge>
                <Button
                  variant="secondary"
                  onClick={() => connectShopify({ reconnect: true })}
                  disabled={connecting || disconnecting}
                >
                  <Cable className="size-4" />
                  {connecting ? 'Redirecting to Shopify…' : 'Reconnect'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={disconnectShopify}
                  disabled={disconnecting || connecting}
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted">This store cannot start OAuth in its current state.</p>
            )}
          </div>
        ) : null}

        {stores.length === 0 ? null : (
          <p className="text-xs text-muted">
            Need another store?{' '}
            <Link className="text-electric hover:underline" to="/settings/store">
              Create one in Store settings
            </Link>
            .
          </p>
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
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-elevated px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-cantaloupe-ink" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-ink">App embed prototype</p>
              <p className="text-xs text-muted">
                Theme embed simulation only — it does not mean Shopify is connected. Use Connect
                Shopify above for the real OAuth flow.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.open(integration.themeEditorUrl, '_blank', 'noopener,noreferrer')
                simulateEnable()
              }}
            >
              Open theme editor
              <ExternalLink className="size-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={simulateEnable}>
              Mark embed done (local)
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-line bg-elevated px-4 py-3 text-sm text-ink">
          App embed marked enabled locally. This prototype state is separate from Shopify OAuth.
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Connection health</h3>
            <p className="text-xs text-muted">Checked {formatDateTime(integration.lastCheckedAt)}</p>
          </div>

          <StatusRow
            label="Store connection"
            value={storeConnected ? 'Connected' : 'Not connected'}
            ok={storeConnected}
            detail={
              activeStore
                ? `${activeStore.name} · ${storeStatusLabel(activeStore.connection_status)}`
                : 'No real store selected'
            }
          />
          <StatusRow
            label="App embed"
            value={embedOk ? 'Enabled (local)' : 'Disabled (local)'}
            ok={embedOk}
            detail="Prototype toggle only"
          />
          <StatusRow
            label="Storefront tracking"
            value={trackingOk ? 'Active (local)' : 'Inactive (local)'}
            ok={trackingOk}
            detail="Prototype status"
          />
          <StatusRow
            label="Signup forms"
            value={formsOk ? 'Active (local)' : 'Blocked (local)'}
            ok={formsOk}
            detail="Prototype status"
          />
          <StatusRow
            label="Popup forms"
            value={popupOk ? 'Active (local)' : 'Blocked (local)'}
            ok={popupOk}
            detail="Prototype status"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="secondary" disabled={checking} onClick={simulateEnable}>
              {checking ? 'Checking…' : 'Simulate embed enabled'}
            </Button>
            <Button variant="ghost" onClick={simulateDisable}>
              Reset local prototype
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Local embed prototype</h3>
          <p className="mb-3 text-xs text-muted">
            Dawn theme references here are local UI only and do not imply a Shopify connection.
          </p>
          <div
            className={cn(
              'rounded-lg border p-4',
              embedOk ? 'border-success/40 bg-success/10' : 'border-line bg-midnight',
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Inboxly App embed</p>
              <Badge tone={embedOk ? 'success' : 'warning'}>{embedOk ? 'On' : 'Off'}</Badge>
            </div>
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
        </Card>
      </div>
    </div>
  )
}
