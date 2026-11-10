import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  FormField,
  Input,
  Textarea,
  Select,
  Badge,
  Tabs,
} from '../../components/ui'

const steps = [
  { id: 'setup', label: 'Setup' },
  { id: 'content', label: 'Content' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'review', label: 'Review' },
]

export function CampaignWizardPage() {
  const { channel } = useParams()
  const navigate = useNavigate()
  const isSms = channel === 'sms'
  const [step, setStep] = useState('setup')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: isSms ? 'New SMS campaign' : 'New email campaign',
    subject: isSms ? '' : 'Your subject line',
    previewText: '',
    audience: 'VIP buyers',
    content: isSms
      ? 'Inboxly Demo: limited offer inside. Reply STOP to opt out.'
      : 'Hi {{first_name}},\n\nShare your offer and product story here.',
    sendMode: 'schedule',
    scheduledAt: '2026-11-15T10:00',
  })

  const stepIndex = steps.findIndex((item) => item.id === step)

  const validate = (targetStep) => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Campaign name is required.'
    if (!isSms && !form.subject.trim()) nextErrors.subject = 'Subject is required for email.'
    if (!form.content.trim()) nextErrors.content = 'Content is required.'
    if (form.sendMode === 'schedule' && !form.scheduledAt) {
      nextErrors.scheduledAt = 'Pick a schedule time.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 || targetStep === 'setup'
  }

  const goNext = () => {
    if (!validate(step)) return
    const next = steps[Math.min(stepIndex + 1, steps.length - 1)]
    setStep(next.id)
  }

  const goBack = () => {
    const prev = steps[Math.max(stepIndex - 1, 0)]
    setStep(prev.id)
  }

  const summary = useMemo(
    () => [
      { label: 'Channel', value: isSms ? 'SMS' : 'Email' },
      { label: 'Name', value: form.name },
      { label: 'Audience', value: form.audience },
      {
        label: 'Send',
        value: form.sendMode === 'now' ? 'Send now (mock)' : `Schedule ${form.scheduledAt}`,
      },
    ],
    [form, isSms],
  )

  return (
    <div>
      <div className="mb-3">
        <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
      </div>

      <PageHeader
        title={isSms ? 'Create SMS campaign' : 'Create email campaign'}
        description="Prototype wizard with client-side validation. Nothing is sent."
        actions={<Badge tone="accent">Mock flow</Badge>}
      />

      <Tabs
        className="mb-4"
        value={step}
        onChange={setStep}
        items={steps.map((item) => ({ value: item.id, label: item.label }))}
      />

      {step === 'setup' && (
        <Card className="space-y-3">
          <FormField label="Campaign name" error={errors.name}>
            <Input
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
            />
          </FormField>
          {!isSms && (
            <>
              <FormField label="Subject line" error={errors.subject}>
                <Input
                  value={form.subject}
                  onChange={(event) => setForm((value) => ({ ...value, subject: event.target.value }))}
                />
              </FormField>
              <FormField label="Preview text">
                <Input
                  value={form.previewText}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, previewText: event.target.value }))
                  }
                />
              </FormField>
            </>
          )}
          <FormField label="Audience">
            <Select
              value={form.audience}
              onChange={(event) => setForm((value) => ({ ...value, audience: event.target.value }))}
            >
              <option>VIP buyers</option>
              <option>Engaged last 30 days</option>
              <option>SMS reachable</option>
              <option>All contacts</option>
            </Select>
          </FormField>
        </Card>
      )}

      {step === 'content' && (
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <FormField label={isSms ? 'SMS message' : 'Email body'} error={errors.content}>
              <Textarea
                rows={12}
                value={form.content}
                onChange={(event) => setForm((value) => ({ ...value, content: event.target.value }))}
              />
            </FormField>
            {isSms && (
              <p className="mt-2 text-xs text-muted">{form.content.length}/160 characters (soft limit)</p>
            )}
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink">Preview</h3>
            <div className="rounded-md border border-line bg-midnight p-4">
              {!isSms && (
                <p className="mb-2 text-sm font-semibold text-ink">{form.subject || 'Subject'}</p>
              )}
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted">{form.content}</pre>
            </div>
          </Card>
        </div>
      )}

      {step === 'schedule' && (
        <Card className="space-y-3">
          <FormField label="Send mode">
            <Select
              value={form.sendMode}
              onChange={(event) => setForm((value) => ({ ...value, sendMode: event.target.value }))}
            >
              <option value="now">Send now (mock)</option>
              <option value="schedule">Schedule for later</option>
            </Select>
          </FormField>
          {form.sendMode === 'schedule' && (
            <FormField label="Schedule time" error={errors.scheduledAt}>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) =>
                  setForm((value) => ({ ...value, scheduledAt: event.target.value }))
                }
              />
            </FormField>
          )}
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Review before mock send</h3>
          <dl className="space-y-2 text-sm">
            {summary.map((item) => (
              <div key={item.label} className="flex justify-between gap-3 border-b border-line/60 py-2">
                <dt className="text-muted">{item.label}</dt>
                <dd className="text-right text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Confirming only updates local UI state. No email or SMS is delivered.
          </p>
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={stepIndex === 0 ? () => navigate('/campaigns') : goBack}>
          {stepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step !== 'review' ? (
          <Button onClick={goNext}>Continue</Button>
        ) : (
          <Button
            onClick={() => {
              alert('Prototype campaign saved locally as draft/scheduled. No send occurred.')
              navigate('/campaigns')
            }}
          >
            Confirm campaign
          </Button>
        )}
      </div>
    </div>
  )
}
