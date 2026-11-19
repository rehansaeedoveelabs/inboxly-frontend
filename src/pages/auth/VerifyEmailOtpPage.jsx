import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, FormField, Input } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { sendEmailOtpRequest, verifyEmailOtpRequest } from '../../auth/authApi'
import { useAuth } from '../../auth/useAuth'
import { AuthLayout } from './AuthLayout'

export function VerifyEmailOtpPage() {
  const { user, refreshUser } = useAuth()
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const onSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setFieldErrors({})
    setNotice('')
    setSubmitting(true)

    try {
      const result = await verifyEmailOtpRequest(code.trim())
      await refreshUser()
      window.location.assign(result.shopify_authorize_url)
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
        setFieldErrors(error.errors ?? {})
      } else {
        setFormError('Unable to verify that code right now.')
      }
      setSubmitting(false)
    }
  }

  const onResend = async () => {
    setFormError('')
    setNotice('')
    setResending(true)
    try {
      await sendEmailOtpRequest()
      setNotice('A new verification code was sent to your email.')
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Unable to resend the code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        user?.email
          ? `Enter the 6-digit code we sent to ${user.email}. After verification you will continue to Shopify.`
          : 'Enter the 6-digit code from your email to continue to Shopify.'
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {notice ? (
          <div
            role="status"
            className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {notice}
          </div>
        ) : null}
        {formError ? (
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        ) : null}

        <FormField label="Verification code" htmlFor="otp-code" error={fieldErrors.code?.[0]}>
          <Input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Verifying…' : 'Verify and connect Shopify'}
        </Button>

        <button
          type="button"
          className="w-full text-sm font-medium text-electric hover:underline disabled:opacity-60"
          onClick={onResend}
          disabled={resending || submitting}
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>

        <p className="text-center text-sm text-muted">
          Wrong account?{' '}
          <Link className="font-medium text-electric hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
