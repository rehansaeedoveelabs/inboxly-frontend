import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, FormField, Input } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../auth/useAuth'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const onSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFieldErrors({})
    setSubmitting(true)

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        workspace_name: workspaceName.trim() || undefined,
      })
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to create your account right now. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start an Inboxly workspace for your brand."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-medium text-electric hover:underline" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {formError ? (
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        ) : null}

        <FormField label="Full name" htmlFor="register-name" error={fieldErrors.name?.[0]}>
          <Input
            id="register-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </FormField>

        <FormField label="Work email" htmlFor="register-email" error={fieldErrors.email?.[0]}>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </FormField>

        <FormField
          label="Workspace name"
          htmlFor="register-workspace"
          hint="Optional — defaults to your name’s workspace."
          error={fieldErrors.workspace_name?.[0]}
        >
          <Input
            id="register-workspace"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="Acme Marketing"
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="register-password"
          hint="At least 8 characters."
          error={fieldErrors.password?.[0]}
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="register-password-confirmation"
          error={fieldErrors.password_confirmation?.[0]}
        >
          <Input
            id="register-password-confirmation"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            minLength={8}
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
