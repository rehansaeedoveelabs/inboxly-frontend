import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, LoadingState } from '../ui'
import { ApiError } from '../../lib/api'
import { listStoreEmailTemplates } from '../../lib/emailTemplatesApi'

/**
 * Pick a store email template to snapshot onto a draft campaign.
 */
export function EmailTemplatePicker({ storeId, disabled, onApply, applyingId }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!storeId) return undefined
    let cancelled = false
    setLoading(true)
    setError('')

    listStoreEmailTemplates(storeId, { limit: 50 })
      .then((page) => {
        if (!cancelled) setTemplates(page.data || [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Unable to load templates.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [storeId])

  if (loading) {
    return (
      <Card>
        <LoadingState label="Loading templates…" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      </Card>
    )
  }

  if (templates.length === 0) {
    return (
      <Card className="space-y-2">
        <p className="text-sm font-semibold text-ink">Email templates</p>
        <p className="text-sm text-muted">
          No templates yet. Create one in Resources, then apply it here.
        </p>
        <Link to="/resources/templates" className="text-sm text-electric hover:underline">
          Open email templates
        </Link>
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">Apply email template</p>
          <p className="text-sm text-muted">
            Copies a snapshot onto this campaign. Later template edits will not change it.
          </p>
        </div>
        <Link to="/resources/templates" className="text-sm text-electric hover:underline">
          Manage templates
        </Link>
      </div>
      <ul className="divide-y divide-line rounded-md border border-line">
        {templates.map((template) => (
          <li
            key={template.id}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-ink">{template.name}</p>
              <p className="text-xs text-muted">
                {template.category || 'general'} · {template.status}
              </p>
            </div>
            <Button
              variant="secondary"
              disabled={disabled || Boolean(applyingId)}
              onClick={() => onApply(template)}
            >
              {applyingId === template.id ? 'Applying…' : 'Use template'}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
