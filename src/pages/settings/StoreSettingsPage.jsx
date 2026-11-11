import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Store } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  FormField,
  Input,
  EmptyState,
  LoadingState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { storeStatusLabel, storeStatusTone } from '../../lib/storesApi'
import { useActiveStore } from '../../store/useActiveStore'

function looksLikeMyshopifyDomain(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)
}

export function StoreSettingsPage() {
  const {
    workspace,
    stores,
    activeStore,
    status,
    error,
    createStore,
    selectStore,
    refreshStores,
  } = useActiveStore()

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [notice, setNotice] = useState('')

  const canCreate = Boolean(workspace?.id && workspace?.permissions?.create_stores !== false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFieldErrors({})
    setNotice('')

    if (!name.trim()) {
      setFieldErrors({ name: ['Enter a store name.'] })
      return
    }
    if (!looksLikeMyshopifyDomain(domain)) {
      setFieldErrors({ domain: ['Use a valid *.myshopify.com domain.'] })
      return
    }

    setSubmitting(true)
    try {
      const store = await createStore({ name: name.trim(), domain: domain.trim() })
      setName('')
      setDomain('')
      setNotice(`Created ${store.name}. It is pending Shopify connection.`)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
        setFieldErrors(err.errors ?? {})
      } else {
        setFormError('Unable to create the store right now.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Store settings"
        description={
          workspace
            ? `Workspace ${workspace.name} · real Inboxly stores only.`
            : 'Create a workspace before adding stores.'
        }
        actions={<Badge tone="accent">Backend stores</Badge>}
      />

      {notice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}{' '}
          <button type="button" className="underline" onClick={() => void refreshStores()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Create Shopify store</h3>
          <p className="text-xs text-muted">
            Creates a pending Inboxly store for your workspace. Demo stores cannot be created
            here.
          </p>

          {!workspace ? (
            <p className="text-sm text-muted">No workspace is available on this account.</p>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit} noValidate>
              {formError ? (
                <div
                  role="alert"
                  className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
                >
                  {formError}
                </div>
              ) : null}

              <FormField label="Store name" htmlFor="store-name" error={fieldErrors.name?.[0]}>
                <Input
                  id="store-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Acme Shop"
                  required
                />
              </FormField>

              <FormField
                label="Shopify domain"
                htmlFor="store-domain"
                hint="Must be a *.myshopify.com hostname."
                error={fieldErrors.domain?.[0]}
              >
                <Input
                  id="store-domain"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="acme-shop.myshopify.com"
                  required
                />
              </FormField>

              <Button type="submit" disabled={submitting || !canCreate}>
                {submitting ? 'Creating…' : 'Create store'}
              </Button>
            </form>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Your stores</h3>
            {activeStore ? (
              <Badge tone={storeStatusTone(activeStore.connection_status)}>
                Active · {storeStatusLabel(activeStore.connection_status)}
              </Badge>
            ) : null}
          </div>

          {status === 'loading' ? <LoadingState label="Loading stores…" /> : null}

          {status !== 'loading' && stores.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No real stores yet"
              description="Create a store with your *.myshopify.com domain, then connect Shopify from Storefront integration."
            />
          ) : null}

          {stores.length > 0 ? (
            <ul className="space-y-2">
              {stores.map((store) => {
                const selected = store.id === activeStore?.id
                return (
                  <li
                    key={store.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-line bg-midnight px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{store.name}</p>
                      <p className="truncate text-xs text-muted">{store.domain}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted">{store.id}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge tone={storeStatusTone(store.connection_status)}>
                        {storeStatusLabel(store.connection_status)}
                      </Badge>
                      {selected ? (
                        <span className="text-xs text-electric">Selected</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void selectStore(store.id)}
                        >
                          Use store
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {activeStore && activeStore.connection_status !== 'connected' ? (
            <p className="text-xs text-muted">
              Next step:{' '}
              <Link className="text-electric hover:underline" to="/settings/storefront">
                Connect Shopify
              </Link>
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
