import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  Badge,
  FormField,
  Input,
  Textarea,
  EmptyState,
  Table,
} from '../../components/ui'
import { useActiveStore } from '../../store/useActiveStore'
import { ApiError } from '../../lib/api'
import {
  activateAutomation,
  archiveAutomation,
  createStoreAutomation,
  defaultWelcomeSteps,
  getAutomation,
  listAutomationEnrollments,
  pauseAutomation,
  updateAutomation,
} from '../../lib/automationsApi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'

function stepsToForm(steps = []) {
  const delay = steps.find((step) => step.type === 'delay')
  const email = steps.find((step) => step.type === 'send_email')
  const condition = steps.find(
    (step) => step.type === 'condition' && step.config?.predicate === 'email_subscribed',
  )
  return {
    delayMinutes: Number(delay?.config?.delay_minutes ?? 0) || 0,
    subject: email?.config?.subject || 'Welcome',
    body: email?.config?.body || 'Thanks for subscribing. We’re glad you’re here.',
    requireEmailSubscribed: Boolean(condition),
  }
}

export function AutomationEditorPage() {
  const { automationId } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = !automationId || automationId === 'new'
  const navigate = useNavigate()
  const { activeStore } = useActiveStore()
  const storeId = activeStore?.id
  const template = searchParams.get('template')
  const isAbandonedTemplate = isNew && template === 'abandoned_cart'

  const [automation, setAutomation] = useState(null)
  const [name, setName] = useState(isAbandonedTemplate ? 'Abandoned cart recovery' : 'Welcome email')
  const [triggerType, setTriggerType] = useState(
    isAbandonedTemplate ? 'checkout.abandoned' : 'contact.email_subscribed',
  )
  const [requireEmailSubscribed, setRequireEmailSubscribed] = useState(false)
  const [delayMinutes, setDelayMinutes] = useState(isAbandonedTemplate ? 60 : 0)
  const [subject, setSubject] = useState(
    isAbandonedTemplate ? 'You left something behind' : 'Welcome',
  )
  const [body, setBody] = useState(
    isAbandonedTemplate
      ? 'Hi {{first_name}}, you left items in your cart at {{shop_name}}. Come back and finish checkout.'
      : 'Thanks for subscribing. We’re glad you’re here.',
  )
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const status = automation?.status || 'draft'

  const load = useCallback(async () => {
    if (isNew) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [detail, history] = await Promise.all([
        getAutomation(automationId),
        listAutomationEnrollments(automationId, { limit: 25 }),
      ])
      setAutomation(detail)
      setName(detail.name || 'Welcome email')
      setTriggerType(detail.trigger_type || 'contact.email_subscribed')
      const form = stepsToForm(detail.steps || [])
      setRequireEmailSubscribed(form.requireEmailSubscribed)
      setDelayMinutes(form.delayMinutes)
      setSubject(form.subject)
      setBody(form.body)
      setEnrollments(history.data || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load automation.')
      setAutomation(null)
    } finally {
      setLoading(false)
    }
  }, [automationId, isNew])

  useEffect(() => {
    load()
  }, [load])

  const canEdit = isNew || status === 'draft' || status === 'paused'

  const buildSteps = () =>
    defaultWelcomeSteps({
      delayMinutes: Number(delayMinutes) || 0,
      subject,
      body,
      requireEmailSubscribed,
    })

  const handleSave = async () => {
    if (!storeId && isNew) {
      setError('Select a store before creating an automation.')
      return
    }
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      if (isNew) {
        const created = await createStoreAutomation(storeId, {
          name: name.trim() || 'Welcome email',
          trigger_type: triggerType,
          steps: buildSteps(),
        })
        setNotice('Draft saved.')
        navigate(`/automation/${created.id}`, { replace: true })
        return
      }

      const updated = await updateAutomation(automationId, {
        name: name.trim() || 'Welcome email',
        steps: buildSteps(),
      })
      setAutomation(updated)
      setNotice('Draft saved.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save automation.')
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (action, successMessage) => {
    setActing(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await action(automationId)
      setAutomation(updated)
      setNotice(successMessage)
      if (action === archiveAutomation || action === activateAutomation || action === pauseAutomation) {
        const history = await listAutomationEnrollments(automationId, { limit: 25 })
        setEnrollments(history.data || [])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed.')
    } finally {
      setActing(false)
    }
  }

  const enrollmentColumns = useMemo(
    () => [
      {
        key: 'contact',
        label: 'Contact',
        render: (row) => row.contact?.email || row.contact_id,
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
      },
      {
        key: 'step_runs',
        label: 'Latest step',
        render: (row) => {
          const runs = row.step_runs || []
          const latest = runs[runs.length - 1]
          if (!latest) return '—'
          return (
            <span>
              {latest.step?.type || 'step'}: {statusLabel(latest.status)}
              {latest.error_code ? ` (${latest.error_code})` : ''}
            </span>
          )
        },
      },
      {
        key: 'enrolled_at',
        label: 'Enrolled',
        render: (row) => formatDateTime(row.enrolled_at),
      },
    ],
    [],
  )

  if (loading) {
    return <p className="text-sm text-muted">Loading automation…</p>
  }

  if (!isNew && error && !automation) {
    return (
      <EmptyState
        title="Automation not found"
        description={error}
        actionLabel="Back to automation"
        onAction={() => navigate('/automation')}
      />
    )
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/automation" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Automation
        </Link>
      </div>

      <PageHeader
        title={isNew ? 'Create automation' : name}
        description="Linear editor: optional condition branch, optional delay, then email. Visual canvas is not available yet."
        actions={
          <>
            {!isNew && <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>}
            {canEdit && (
              <Button variant="secondary" disabled={saving || acting} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save draft'}
              </Button>
            )}
            {!isNew && status !== 'active' && status !== 'archived' && (
              <Button
                disabled={acting || saving}
                onClick={() =>
                  runAction(
                    activateAutomation,
                    status === 'paused'
                      ? 'Automation resumed. Enrollment is active again; due runs will continue.'
                      : 'Automation activated. Matching contacts can enroll on the selected trigger.',
                  )
                }
              >
                {status === 'paused' ? 'Resume' : 'Activate'}
              </Button>
            )}
            {!isNew && status === 'active' && (
              <Button
                variant="secondary"
                disabled={acting}
                onClick={() =>
                  runAction(
                    pauseAutomation,
                    'Automation paused. New contacts will not enroll; pending runs stay frozen until Resume.',
                  )
                }
              >
                Pause
              </Button>
            )}
            {!isNew && status !== 'archived' && (
              <Button
                variant="secondary"
                disabled={acting}
                onClick={() =>
                  runAction(
                    archiveAutomation,
                    'Automation archived. Active enrollments and pending runs were cancelled.',
                  )
                }
              >
                Archive
              </Button>
            )}
          </>
        }
      />

      {notice && <p className="mb-3 text-sm text-success">{notice}</p>}
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Configuration</h3>
          <div className="space-y-3">
            <FormField label="Name">
              <Input
                value={name}
                disabled={!canEdit || saving}
                onChange={(event) => setName(event.target.value)}
              />
            </FormField>
            <FormField label="Trigger">
              <select
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink"
                value={triggerType}
                disabled={!isNew || saving}
                onChange={(event) => setTriggerType(event.target.value)}
              >
                <option value="contact.email_subscribed">Email subscribed</option>
                <option value="contact.tag_added">Tag added</option>
                <option value="checkout.abandoned">Checkout abandoned (Shopify)</option>
              </select>
              {triggerType === 'checkout.abandoned' ? (
                <p className="mt-1 text-xs text-muted">
                  Fires when Shopify sends a checkout webhook with a customer email. Reconnect
                  Shopify if `read_checkouts` is missing.
                </p>
              ) : null}
            </FormField>
            <label className="flex items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="mt-1"
                checked={requireEmailSubscribed}
                disabled={!canEdit || saving}
                onChange={(event) => setRequireEmailSubscribed(event.target.checked)}
              />
              <span>
                Require email subscribed before send
                <span className="mt-0.5 block text-xs text-muted">
                  Adds a condition branch: if not subscribed, the enrollment ends without sending.
                </span>
              </span>
            </label>
            <FormField label="Delay before send (minutes)">
              <Input
                type="number"
                min={0}
                value={delayMinutes}
                disabled={!canEdit || saving}
                onChange={(event) => setDelayMinutes(Number(event.target.value) || 0)}
              />
            </FormField>
            <FormField label="Email subject">
              <Input
                value={subject}
                disabled={!canEdit || saving}
                onChange={(event) => setSubject(event.target.value)}
              />
            </FormField>
            <FormField label="Email body">
              <Textarea
                rows={8}
                value={body}
                disabled={!canEdit || saving}
                onChange={(event) => setBody(event.target.value)}
              />
            </FormField>
            {status === 'paused' && (
              <p className="text-xs text-muted">
                Paused automations do not enroll new contacts. Save any edits, then choose Resume to
                reactivate enrollment and continue due runs.
              </p>
            )}
            {!canEdit && (
              <p className="text-xs text-muted">
                Pause the automation to edit steps, or archive and create a new draft.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Enrollment & execution history</h3>
          {isNew ? (
            <p className="text-sm text-muted">Save and activate to enroll contacts who subscribe.</p>
          ) : enrollments.length === 0 ? (
            <p className="text-sm text-muted">No enrollments yet.</p>
          ) : (
            <Table columns={enrollmentColumns} rows={enrollments} />
          )}
        </Card>
      </div>
    </div>
  )
}
