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
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
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
      const result = await register({
        name,
        email,
        phone,
        shop_name: shopName,
        password,
        password_confirmation: passwordConfirmation,
      })
      if (result?.email_otp_required !== false) {
        navigate('/verify-email', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
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
      subtitle="Enter your shop details. You will connect Shopify after email verification — no shop URL required."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {formError ? (
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        ) : null}

        <FormField label="Shop name" htmlFor="register-shop-name" error={fieldErrors.shop_name?.[0]}>
          <Input
            id="register-shop-name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            autoComplete="organization"
            required
          />
        </FormField>

        <FormField label="Full name" htmlFor="register-name" error={fieldErrors.name?.[0]}>
          <Input
            id="register-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </FormField>

        <FormField label="Phone" htmlFor="register-phone" error={fieldErrors.phone?.[0]}>
          <Input
            id="register-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />
        </FormField>

        <FormField label="Work email" htmlFor="register-email" error={fieldErrors.email?.[0]}>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </FormField>

        <FormField label="Password" htmlFor="register-password" error={fieldErrors.password?.[0]}>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
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
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link className="font-medium text-electric hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
