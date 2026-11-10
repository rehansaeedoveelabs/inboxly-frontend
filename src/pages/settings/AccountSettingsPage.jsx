import { useState } from 'react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  FormField,
  Input,
  Table,
  ThemeSwitcher,
} from '../../components/ui'
import { getAccountSettings } from '../../mock'
import { useTheme } from '../../theme/useTheme'

export function AccountSettingsPage() {
  const initial = getAccountSettings()
  const [account, setAccount] = useState(initial)
  const [notice, setNotice] = useState('')
  const { preference, resolved } = useTheme()

  const save = () => {
    setNotice('Account preferences updated locally — not saved to a backend.')
    window.setTimeout(() => setNotice(''), 2500)
  }

  return (
    <div>
      <PageHeader
        title="Account settings"
        description="Workspace users and preferences for this prototype session."
        actions={<Badge tone="accent">Prototype</Badge>}
      />

      {notice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Profile</h3>
          <FormField label="Workspace name">
            <Input
              value={account.workspaceName}
              onChange={(event) =>
                setAccount((value) => ({ ...value, workspaceName: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Your name">
            <Input
              value={account.user.name}
              onChange={(event) =>
                setAccount((value) => ({
                  ...value,
                  user: { ...value.user, name: event.target.value },
                }))
              }
            />
          </FormField>
          <FormField label="Email">
            <Input value={account.user.email} readOnly />
          </FormField>
          <p className="text-xs text-muted">Role: {account.user.role}</p>
          <Button onClick={save}>Save profile</Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Preferences</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-ink">Appearance</p>
              <p className="text-xs text-muted">
                Preference: {preference} · Applied: {resolved}. Saved in this browser only.
              </p>
            </div>
            <ThemeSwitcher />
          </div>
          {[
            ['emailDigest', 'Email digest'],
            ['productUpdates', 'Product updates'],
            ['weeklyReport', 'Weekly performance report'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3 text-sm text-ink">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={account.preferences[key]}
                onChange={(event) =>
                  setAccount((value) => ({
                    ...value,
                    preferences: {
                      ...value.preferences,
                      [key]: event.target.checked,
                    },
                  }))
                }
              />
            </label>
          ))}
          <Button variant="secondary" onClick={save}>
            Save preferences
          </Button>
        </Card>

        <Card className="lg:col-span-2" padding={false}>
          <div className="border-b border-line px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Workspace members</h3>
          </div>
          <div className="p-4">
            <Table
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                {
                  key: 'role',
                  label: 'Role',
                  render: (row) => <Badge tone="info">{row.role}</Badge>,
                },
              ]}
              rows={account.members}
            />
            <Button
              className="mt-3"
              variant="secondary"
              onClick={() =>
                alert('Prototype only — invite flow is not connected to email delivery.')
              }
            >
              Invite member
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
