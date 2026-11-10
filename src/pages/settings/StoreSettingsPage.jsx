import { useState } from 'react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  FormField,
  Input,
  Select,
} from '../../components/ui'
import { getStoreSettings } from '../../mock'
import { formatDateTime, formatNumber } from '../../lib/format'

export function StoreSettingsPage() {
  const initial = getStoreSettings()
  const [settings, setSettings] = useState(initial)
  const [notice, setNotice] = useState('')

  const save = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  return (
    <div>
      <PageHeader
        title="Store settings"
        description={`Brand ID ${settings.brandId} · Prototype configuration only.`}
        actions={<Badge tone="accent">Mock store data</Badge>}
      />

      {notice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Store information</h3>
          <FormField label="Store name">
            <Input
              value={settings.storeName}
              onChange={(event) =>
                setSettings((value) => ({ ...value, storeName: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Domain">
            <Input value={settings.domain} readOnly />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Timezone">
              <Select
                value={settings.timezone}
                onChange={(event) =>
                  setSettings((value) => ({ ...value, timezone: event.target.value }))
                }
              >
                <option>America/Los_Angeles</option>
                <option>America/New_York</option>
                <option>UTC</option>
              </Select>
            </FormField>
            <FormField label="Currency">
              <Select
                value={settings.currency}
                onChange={(event) =>
                  setSettings((value) => ({ ...value, currency: event.target.value }))
                }
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </Select>
            </FormField>
          </div>
          <Button onClick={() => save('Store profile updated locally — not saved to a backend.')}>
            Save store profile
          </Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Connected store</h3>
          <div className="flex items-center gap-3 rounded-md border border-line bg-midnight p-3">
            <div className="flex size-12 items-center justify-center rounded-md bg-secondary text-xs font-bold text-ink">
              Shop
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{settings.storeName}</p>
              <p className="text-xs text-muted">
                Connected {formatDateTime(settings.connectedAt)}
              </p>
            </div>
            <Badge tone="success" className="ml-auto">
              Connected (mock)
            </Badge>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={settings.allowAdminSignIn}
              onChange={(event) =>
                setSettings((value) => ({ ...value, allowAdminSignIn: event.target.checked }))
              }
            />
            Allow Shopify admin sign-in without password (prototype toggle)
          </label>

          <div className="rounded-md border border-line bg-midnight p-3 text-sm">
            <p className="font-medium text-ink">Imported store data</p>
            <p className="mt-1 text-muted">
              Last import {formatDateTime(settings.lastImportAt)} ·{' '}
              {formatNumber(settings.importedContacts)} contacts ·{' '}
              {formatNumber(settings.importedProducts)} products
            </p>
          </div>

          <label className="flex items-center justify-between gap-3 text-sm text-ink">
            <span>Sync contact tag changes to Shopify</span>
            <input
              type="checkbox"
              checked={settings.syncTagsToShopify}
              onChange={(event) =>
                setSettings((value) => ({ ...value, syncTagsToShopify: event.target.checked }))
              }
            />
          </label>
        </Card>

        <Card className="space-y-3 lg:col-span-2">
          <h3 className="text-sm font-semibold text-ink">Manage tracking cookies</h3>
          <p className="text-sm text-muted">
            Choose when storefront tracking starts. This does not change a real Shopify theme.
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="tracking"
                checked={settings.trackingMode === 'before_consent'}
                onChange={() =>
                  setSettings((value) => ({ ...value, trackingMode: 'before_consent' }))
                }
              />
              Track visitors before they consent
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="tracking"
                checked={settings.trackingMode === 'after_consent'}
                onChange={() =>
                  setSettings((value) => ({ ...value, trackingMode: 'after_consent' }))
                }
              />
              Wait for consent before tracking
            </label>
          </div>
          <Button
            variant="secondary"
            onClick={() => save('Tracking preference updated locally — prototype only.')}
          >
            Save tracking settings
          </Button>
        </Card>
      </div>
    </div>
  )
}
