import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LoadingState } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { continueShopifyInstallRequest } from '../../auth/authApi'
import { AuthLayout } from './AuthLayout'

/**
 * Partner App URL landing: Shopify redirects here with ?shop=&hmac= after install picker.
 * Continues OAuth authorize with CSRF state, then browser goes to Shopify authorize.
 */
export function ShopifyInstallContinuePage() {
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const query = Object.fromEntries(searchParams.entries())
      if (!query.shop) {
        setError('Shopify did not return a shop. Start connect again from Inboxly.')
        return
      }

      try {
        const url = await continueShopifyInstallRequest(query)
        if (!cancelled) {
          window.location.assign(url)
        }
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to continue Shopify installation.',
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  return (
    <AuthLayout title="Connecting Shopify" subtitle="Finishing authorization with Shopify…">
      {error ? (
        <div className="space-y-3">
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
          <p className="text-sm text-muted">
            <Link className="font-medium text-electric hover:underline" to="/settings/storefront">
              Back to Storefront integration
            </Link>
          </p>
        </div>
      ) : (
        <LoadingState label="Redirecting to Shopify…" />
      )}
    </AuthLayout>
  )
}
