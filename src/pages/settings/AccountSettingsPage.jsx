import { useEffect, useMemo, useState } from 'react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  FormField,
  Input,
  Table,
  ThemeSwitcher,
  LoadingState,
  ErrorState,
} from '../../components/ui'
import { updatePasswordRequest, updateProfileRequest } from '../../auth/authApi'
import { useAuth } from '../../auth/useAuth'
import { getPrimaryWorkspace } from '../../auth/backendStore'
import { ApiError } from '../../lib/api'
import { firstFieldError } from '../../lib/tagsUi'
import { listWorkspaceMembers, updateWorkspace } from '../../lib/workspaceApi'
import { useTheme } from '../../theme/useTheme'

export function AccountSettingsPage() {
  const { user, refreshUser, status: authStatus } = useAuth()
  const workspace = useMemo(() => getPrimaryWorkspace(user), [user])
  const { preference, resolved } = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileFieldErrors, setProfileFieldErrors] = useState({})
  const [passwordError, setPasswordError] = useState('')
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({})
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setEmail(user.email || '')
    setWorkspaceName(workspace?.name || '')
  }, [user, workspace?.name])

  useEffect(() => {
    if (!workspace?.id) {
      setMembers([])
      return undefined
    }

    let cancelled = false
    setMembersLoading(true)
    setMembersError('')
    listWorkspaceMembers(workspace.id)
      .then((rows) => {
        if (!cancelled) setMembers(rows)
      })
      .catch((error) => {
        if (!cancelled) {
          setMembers([])
          setMembersError(error instanceof ApiError ? error.message : 'Unable to load members.')
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [workspace?.id])

  const flash = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  const saveProfile = async () => {
    if (profileSaving) return
    setProfileSaving(true)
    setProfileError('')
    setProfileFieldErrors({})
    try {
      await updateProfileRequest({ name: name.trim(), email: email.trim() })
      if (workspace?.id && workspaceName.trim() && workspaceName.trim() !== workspace.name) {
        await updateWorkspace(workspace.id, { name: workspaceName.trim() })
      }
      await refreshUser()
      flash('Profile saved.')
    } catch (error) {
      if (error instanceof ApiError) {
        setProfileError(error.message)
        setProfileFieldErrors({
          name: firstFieldError(error.errors, 'name') || undefined,
          email: firstFieldError(error.errors, 'email') || undefined,
        })
      } else {
        setProfileError('Unable to save profile.')
      }
    } finally {
      setProfileSaving(false)
    }
  }

  const savePassword = async () => {
    if (passwordSaving) return
    setPasswordSaving(true)
    setPasswordError('')
    setPasswordFieldErrors({})
    try {
      await updatePasswordRequest({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      flash('Password updated.')
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordError(error.message)
        setPasswordFieldErrors({
          current_password: firstFieldError(error.errors, 'current_password') || undefined,
          password: firstFieldError(error.errors, 'password') || undefined,
        })
      } else {
        setPasswordError('Unable to update password.')
      }
    } finally {
      setPasswordSaving(false)
    }
  }

  if (authStatus === 'loading') {
    return <LoadingState label="Loading account…" />
  }

  if (!user) {
    return (
      <ErrorState
        title="Not signed in"
        description="Sign in to manage your account settings."
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Account settings"
        description="Profile, password, appearance, and workspace members."
        actions={<Badge tone="info">{workspace?.role || 'member'}</Badge>}
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
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              disabled={!workspace?.permissions?.manage_settings}
            />
          </FormField>
          <FormField label="Your name" error={profileFieldErrors.name}>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="Email" error={profileFieldErrors.email}>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </FormField>
          {profileError ? (
            <p className="text-sm text-danger" role="alert">
              {profileError}
            </p>
          ) : null}
          <Button disabled={profileSaving} onClick={saveProfile}>
            {profileSaving ? 'Saving…' : 'Save profile'}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Password</h3>
          <FormField label="Current password" error={passwordFieldErrors.current_password}>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="New password" error={passwordFieldErrors.password}>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm new password">
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          {passwordError ? (
            <p className="text-sm text-danger" role="alert">
              {passwordError}
            </p>
          ) : null}
          <Button variant="secondary" disabled={passwordSaving} onClick={savePassword}>
            {passwordSaving ? 'Updating…' : 'Update password'}
          </Button>

          <div className="border-t border-line pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-ink">Appearance</p>
                <p className="text-xs text-muted">
                  Preference: {preference} · Applied: {resolved}. Saved in this browser only.
                </p>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" padding={false}>
          <div className="border-b border-line px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Workspace members</h3>
          </div>
          <div className="p-4">
            {membersLoading ? <p className="text-sm text-muted">Loading members…</p> : null}
            {membersError ? (
              <p className="text-sm text-danger" role="alert">
                {membersError}
              </p>
            ) : null}
            {!membersLoading && !membersError ? (
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
                rows={members}
              />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
