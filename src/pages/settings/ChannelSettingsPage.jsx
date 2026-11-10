import { useState } from 'react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  FormField,
  Input,
  Textarea,
  Tabs,
} from '../../components/ui'
import { getChannelSettings } from '../../mock'

export function ChannelSettingsPage() {
  const initial = getChannelSettings()
  const [settings, setSettings] = useState(initial)
  const [tab, setTab] = useState('email')
  const [notice, setNotice] = useState('')

  const save = () => {
    setNotice('Channel settings updated locally — prototype data only, not persisted.')
    window.setTimeout(() => setNotice(''), 2500)
  }

  return (
    <div>
      <PageHeader
        title="Channel settings"
        description="Email, SMS and web push configuration for the demo workspace."
        actions={<Badge tone="accent">Prototype</Badge>}
      />

      {notice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          {notice}
        </div>
      ) : null}

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS' },
          { value: 'webpush', label: 'Web push' },
        ]}
      />

      {tab === 'email' && (
        <Card className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Email settings</h3>
            <Badge tone={settings.email.verified ? 'success' : 'warning'}>
              {settings.email.verified ? 'Verified (mock)' : 'Unverified'}
            </Badge>
          </div>
          <FormField label="From name">
            <Input
              value={settings.email.fromName}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, fromName: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="From email">
            <Input
              value={settings.email.fromEmail}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, fromEmail: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Reply-to">
            <Input
              value={settings.email.replyTo}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, replyTo: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Footer address">
            <Textarea
              value={settings.email.footerAddress}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  email: { ...value.email, footerAddress: event.target.value },
                }))
              }
            />
          </FormField>
          <Button onClick={save}>Save email settings</Button>
        </Card>
      )}

      {tab === 'sms' && (
        <Card className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">SMS settings</h3>
            <Badge tone={settings.sms.enabled ? 'success' : 'neutral'}>
              {settings.sms.enabled ? 'Enabled (mock)' : 'Disabled'}
            </Badge>
          </div>
          <FormField label="Sender ID">
            <Input
              value={settings.sms.senderId}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  sms: { ...value.sms, senderId: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Compliance text">
            <Textarea
              value={settings.sms.complianceText}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  sms: { ...value.sms, complianceText: event.target.value },
                }))
              }
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
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
            Enable SMS channel (prototype)
          </label>
          <Button onClick={save}>Save SMS settings</Button>
        </Card>
      )}

      {tab === 'webpush' && (
        <Card className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Web push settings</h3>
            <Badge tone={settings.webPush.enabled ? 'success' : 'neutral'}>
              {settings.webPush.enabled ? 'Enabled (mock)' : 'Disabled'}
            </Badge>
          </div>
          <FormField label="Prompt icon label">
            <Input
              value={settings.webPush.iconLabel}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  webPush: { ...value.webPush, iconLabel: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Prompt delay (seconds)">
            <Input
              type="number"
              value={settings.webPush.promptDelaySeconds}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  webPush: {
                    ...value.webPush,
                    promptDelaySeconds: Number(event.target.value),
                  },
                }))
              }
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.webPush.enabled}
              onChange={(event) =>
                setSettings((value) => ({
                  ...value,
                  webPush: { ...value.webPush, enabled: event.target.checked },
                }))
              }
            />
            Enable web push prompts (prototype)
          </label>
          <Button onClick={save}>Save web push settings</Button>
        </Card>
      )}
    </div>
  )
}
