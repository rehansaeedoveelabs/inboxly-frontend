import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  FormField,
  Input,
  Textarea,
  Tabs,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  channelsFromStore,
  defaultChannelSettings,
  updateStoreChannels,
} from '../../lib/channelsApi'
import { useActiveStore } from '../../store/useActiveStore'

export function ChannelSettingsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus, refreshStores } = useActiveStore()
  const storeId = activeStore?.id

  const [settings, setSettings] = useState(defaultChannelSettings)
  const [tab, setTab] = useState('email')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const hydrate = useCallback(() => {
    if (!activeStore) {
      setSettings(defaultChannelSettings())
      setLoading(false)
      return
    }
    setSettings(channelsFromStore(activeStore))
    setLoading(false)
    setError('')
  }, [activeStore])

  useEffect(() => {
    if (storeStatus === 'loading') return
    hydrate()
  }, [storeStatus, hydrate])

  const save = async () => {
    if (!storeId || saving) return
    setSaving(true)
    setError('')
    try {
      const next = await updateStoreChannels(storeId, settings)
      setSettings(next)
      await refreshStores?.()
      setNotice('Channel settings saved for this store.')
      window.setTimeout(() => setNotice(''), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save channel settings.')
    } finally {
      setSaving(false)
    }
  }

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading channel settings…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Channel settings are scoped to the active store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  if (error && !settings) {
    return <ErrorState title="Unable to load channels" description={error} onRetry={hydrate} />
  }

  return (
    <div>
      <PageHeader
        title="Channel settings"
        description={`Email, SMS, and web push defaults for ${activeStore?.name || 'your store'}.`}
        actions={<Badge tone="info">Live</Badge>}
      />

      {notice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          {notice}
        </div>
      ) : null}
      {error ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS' },
          { value: 'webpush', label: 'Web push (soon)' },
        ]}
      />

      {tab === 'email' ? (
        <Card className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Email settings</h3>
            <Badge tone={settings.email.from_email ? 'success' : 'warning'}>
              {settings.email.from_email ? 'Configured' : 'Needs from email'}
            </Badge>
          </div>
          <FormField label="From name">
            <Input
              value={settings.email.from_name}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, from_name: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="From email">
            <Input
              value={settings.email.from_email}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, from_email: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Reply-to">
            <Input
              value={settings.email.reply_to}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, reply_to: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Footer address">
            <Textarea
              value={settings.email.footer_address}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, footer_address: event.target.value },
                }))
              }
            />
          </FormField>
          <p className="text-xs text-muted">
            These are store defaults for campaign content and compliance. Delivery is configured for
            your Inboxly workspace.
          </p>
          <Button disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save email settings'}
          </Button>
        </Card>
      ) : null}

      {tab === 'sms' ? (
        <Card className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">SMS settings</h3>
            <Badge tone={settings.sms.enabled ? 'success' : 'neutral'}>
              {settings.sms.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <FormField label="Sender ID">
            <Input
              value={settings.sms.sender_id}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  sms: { ...value.sms, sender_id: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Compliance text">
            <Textarea
              value={settings.sms.compliance_text}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  sms: { ...value.sms, compliance_text: event.target.value },
                }))
              }
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={settings.sms.enabled}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  sms: { ...value.sms, enabled: event.target.checked },
                }))
              }
            />
            Enable SMS channel for this store
          </label>
          <Button disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save SMS settings'}
          </Button>
        </Card>
      ) : null}

      {tab === 'webpush' ? (
        <Card className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Web push</h3>
            <Badge tone="neutral">Coming soon</Badge>
          </div>
          <p className="text-sm text-muted">
            Browser push notifications are not available yet. Email and SMS settings above are live
            for this store.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
