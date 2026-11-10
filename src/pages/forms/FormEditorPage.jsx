import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  Badge,
  FormField,
  Input,
  Textarea,
  Select,
  Tabs,
  EmptyState,
} from '../../components/ui'
import { getFormById } from '../../mock'
import { statusLabel, statusTone } from '../../lib/format'
import { cn } from '../../lib/cn'

function createBlank(type) {
  return {
    id: 'form_new',
    name: type === 'embedded' ? 'New embedded form' : 'New popup form',
    type: type || 'popup',
    status: 'draft',
    submissions: 0,
    conversionRate: 0,
    headline: 'GET 10% OFF YOUR FIRST ORDER',
    subheadline: 'Join for drops, offers, and early access.',
    buttonLabel: 'Subscribe',
    fields: [
      { id: 'f_email', type: 'email', label: 'Email', required: true },
      { id: 'f_consent', type: 'consent', label: 'I agree to receive marketing emails', required: true },
    ],
    theme: {
      accent: '#2878FF',
      background: '#FFFFFF',
      text: '#10131C',
    },
    behavior: {
      display: 'After 8 seconds',
      devices: 'Desktop & mobile',
      frequency: 'Once every 14 days',
    },
  }
}

export function FormEditorPage() {
  const { formId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const existing = formId && formId !== 'new' ? getFormById(formId) : null
  const [form, setForm] = useState(() => existing || createBlank(searchParams.get('type')))
  const [device, setDevice] = useState('desktop')
  const [panel, setPanel] = useState('content')

  if (formId && formId !== 'new' && !existing) {
    return (
      <EmptyState
        title="Form not found"
        description="This form ID is not in the mock dataset."
        actionLabel="Back to forms"
        onAction={() => navigate('/forms')}
      />
    )
  }

  const previewWidth = device === 'mobile' ? 'max-w-sm' : 'max-w-lg'

  const fieldPalette = useMemo(
    () => [
      { type: 'email', label: 'Email' },
      { type: 'phone', label: 'Phone number' },
      { type: 'consent', label: 'Legal consent' },
      { type: 'text', label: 'Text input' },
    ],
    [],
  )

  const addField = (type) => {
    setForm((current) => ({
      ...current,
      fields: [
        ...current.fields,
        {
          id: `f_${Date.now()}`,
          type,
          label: type === 'consent' ? 'I agree to receive updates' : type[0].toUpperCase() + type.slice(1),
          required: type === 'consent',
        },
      ],
    }))
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/forms" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          Forms
        </Link>
      </div>

      <PageHeader
        title={form.name}
        description="Visual form editor prototype with live preview updates."
        actions={
          <>
            <Badge tone={statusTone(form.status)}>{statusLabel(form.status)}</Badge>
            <div className="flex overflow-hidden rounded-md border border-line">
              <button
                type="button"
                className={cn(
                  'px-2.5 py-1.5 text-muted hover:text-ink',
                  device === 'desktop' && 'bg-secondary text-ink',
                )}
                aria-label="Desktop preview"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="size-4" />
              </button>
              <button
                type="button"
                className={cn(
                  'px-2.5 py-1.5 text-muted hover:text-ink',
                  device === 'mobile' && 'bg-secondary text-ink',
                )}
                aria-label="Mobile preview"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="size-4" />
              </button>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setForm((current) => ({
                  ...current,
                  status: current.status === 'enabled' ? 'draft' : 'enabled',
                }))
              }}
            >
              {form.status === 'enabled' ? 'Disable' : 'Enable form'}
            </Button>
            <Button onClick={() => alert('Prototype only — form not persisted.')}>Save</Button>
          </>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[16rem_1fr_18rem]">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Items</h3>
          <div className="space-y-2">
            {fieldPalette.map((item) => (
              <button
                key={item.type}
                type="button"
                className="flex w-full rounded-md border border-line bg-midnight px-3 py-2 text-left text-sm text-ink hover:border-electric"
                onClick={() => addField(item.type)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-[28rem] items-center justify-center bg-secondary/40">
          <div
            className={cn('w-full rounded-xl border border-line p-5 shadow-lg', previewWidth)}
            style={{ background: form.theme.background, color: form.theme.text }}
          >
            <h2 className="text-xl font-bold tracking-tight">{form.headline}</h2>
            <p className="mt-2 text-sm opacity-80">{form.subheadline}</p>
            <div className="mt-4 space-y-3">
              {form.fields.map((field) =>
                field.type === 'consent' ? (
                  <label key={field.id} className="flex items-start gap-2 text-xs opacity-90">
                    <input type="checkbox" className="mt-0.5" readOnly />
                    <span>{field.label}</span>
                  </label>
                ) : (
                  <input
                    key={field.id}
                    readOnly
                    placeholder={field.label}
                    className="h-10 w-full rounded-md border border-black/10 px-3 text-sm"
                    style={{ background: '#fff', color: '#10131C' }}
                  />
                ),
              )}
              <button
                type="button"
                className="h-10 w-full rounded-md text-sm font-semibold text-white"
                style={{ background: form.theme.accent }}
              >
                {form.buttonLabel}
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <Tabs
            className="mb-3 w-full"
            value={panel}
            onChange={setPanel}
            items={[
              { value: 'content', label: 'Content' },
              { value: 'theme', label: 'Theme' },
              { value: 'behavior', label: 'Behavior' },
            ]}
          />

          {panel === 'content' && (
            <div className="space-y-3">
              <FormField label="Form name">
                <Input
                  value={form.name}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                />
              </FormField>
              <FormField label="Headline">
                <Input
                  value={form.headline}
                  onChange={(event) => setForm((value) => ({ ...value, headline: event.target.value }))}
                />
              </FormField>
              <FormField label="Subheadline">
                <Textarea
                  value={form.subheadline}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, subheadline: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Button label">
                <Input
                  value={form.buttonLabel}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, buttonLabel: event.target.value }))
                  }
                />
              </FormField>
            </div>
          )}

          {panel === 'theme' && (
            <div className="space-y-3">
              <FormField label="Accent">
                <Input
                  value={form.theme.accent}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      theme: { ...value.theme, accent: event.target.value },
                    }))
                  }
                />
              </FormField>
              <FormField label="Background">
                <Input
                  value={form.theme.background}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      theme: { ...value.theme, background: event.target.value },
                    }))
                  }
                />
              </FormField>
              <FormField label="Text">
                <Input
                  value={form.theme.text}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      theme: { ...value.theme, text: event.target.value },
                    }))
                  }
                />
              </FormField>
            </div>
          )}

          {panel === 'behavior' && (
            <div className="space-y-3">
              <FormField label="Display">
                <Select
                  value={form.behavior.display}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      behavior: { ...value.behavior, display: event.target.value },
                    }))
                  }
                >
                  <option>After 8 seconds</option>
                  <option>On exit intent</option>
                  <option>Always visible</option>
                </Select>
              </FormField>
              <FormField label="Devices">
                <Select
                  value={form.behavior.devices}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      behavior: { ...value.behavior, devices: event.target.value },
                    }))
                  }
                >
                  <option>Desktop & mobile</option>
                  <option>Desktop only</option>
                  <option>Mobile only</option>
                </Select>
              </FormField>
              <FormField label="Frequency">
                <Select
                  value={form.behavior.frequency}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      behavior: { ...value.behavior, frequency: event.target.value },
                    }))
                  }
                >
                  <option>Once every 14 days</option>
                  <option>Once per session</option>
                  <option>N/A</option>
                </Select>
              </FormField>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
