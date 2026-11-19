import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, FileText, Monitor, Plus, Smartphone } from 'lucide-react'
import { Card, FormField, Input, Textarea } from '../ui'
import { cn } from '../../lib/cn'
import { personalizeMergeTags } from '../../lib/emailTemplateCatalog'
import { StarterMessagePicker } from './StarterMessagePicker'
import { EmailHtmlPreview } from '../emailTemplates/EmailHtmlPreview'
import { SmsPhonePreview } from './SmsPhonePreview'

/**
 * Template step for email + SMS campaigns.
 * "Browse my templates" calls onBrowseTemplates (wizard saves draft, sets return
 * context, opens Email or SMS Templates). After Choose/Use, merchant returns here.
 */
export function CampaignTemplateStep({
  channel,
  form,
  errors,
  shopName,
  browsing,
  onBrowseTemplates,
  onBrowseEmailTemplates,
  onChangeForm,
  onClearErrors,
  onResetContent,
  onApplyStarterFields,
}) {
  const isSms = channel === 'sms'
  const [mode, setMode] = useState(() => {
    if (form.body?.trim() || form.htmlBody?.trim() || form.subject?.trim()) return 'scratch'
    return null
  })
  const [viewport, setViewport] = useState('desktop')
  const [showPlainFallback, setShowPlainFallback] = useState(false)

  // Prefer htmlBody even if content_format drifted — apply-template always sets both.
  const hasHtmlContent = !isSms && Boolean(form.htmlBody?.trim())
  const previewShop = shopName || 'Your shop'

  // After returning from Email Templates, open the editor so the personalized preview is visible.
  useEffect(() => {
    if (hasHtmlContent || form.body?.trim() || form.subject?.trim()) {
      setMode((current) => current ?? 'scratch')
    }
  }, [hasHtmlContent, form.body, form.subject])

  const previewHtml = useMemo(() => {
    if (!hasHtmlContent) return ''
    return personalizeMergeTags(form.htmlBody, {
      shopName: previewShop,
      firstName: 'Alex',
      discountCode: 'SAVE20',
    })
  }, [form.htmlBody, hasHtmlContent, previewShop])

  const openBrowse = () => {
    const browse = onBrowseTemplates || onBrowseEmailTemplates
    if (browse) {
      browse()
      return
    }
    if (isSms) setMode('browse')
  }

  const openScratch = () => {
    setMode('scratch')
    // Only wipe when starting a blank message — keep applied HTML when reviewing.
    if (!hasHtmlContent && !form.body?.trim()) {
      onResetContent?.()
    }
    onClearErrors?.()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Choose a template</h2>
        <p className="mt-1 text-sm text-muted">
          {isSms
            ? 'Browse SMS message templates, or create a new message from scratch.'
            : 'Browse the Email Templates library, pick or edit a design, then you will return here to continue.'}
        </p>
      </div>

      {(form.body?.trim() || hasHtmlContent) && mode !== 'scratch' ? (
        <Card className="border-success/30 bg-success/10 p-4">
          <p className="text-sm font-medium text-ink">Template content is ready</p>
          <p className="mt-1 text-sm text-muted">
            You can continue, edit the message below, or browse again for a different design.
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-electric hover:underline"
            onClick={() => setMode('scratch')}
          >
            Review / edit message
          </button>
        </Card>
      ) : null}

      <div className="grid gap-3">
        <button
          type="button"
          disabled={browsing}
          onClick={openBrowse}
          className={cn(
            'flex items-center gap-4 rounded-2xl border p-4 text-left transition',
            'border-line bg-elevated hover:border-electric/50 disabled:opacity-60',
          )}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-midnight text-ink">
            <FileText className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">
              {browsing ? 'Opening templates…' : 'Browse my templates'}
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              {isSms
                ? 'Opens SMS Templates — after you choose one, you return to this campaign'
                : 'Opens Email Templates — after you choose one, you return to this campaign'}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted" />
        </button>

        <button
          type="button"
          onClick={openScratch}
          className={cn(
            'flex items-center gap-4 rounded-2xl border border-dashed p-4 text-left transition',
            mode === 'scratch'
              ? 'border-electric bg-electric/10'
              : 'border-line bg-elevated hover:border-electric/50',
          )}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-midnight text-ink">
            <Plus className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Create new</span>
            <span className="mt-0.5 block text-sm text-muted">
              {isSms
                ? 'Write your SMS from a blank message'
                : hasHtmlContent
                  ? 'Edit subject and preview text for this design'
                  : 'Write subject and body here without leaving the campaign'}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted" />
        </button>
      </div>

      {isSms && mode === 'browse' ? (
        <StarterMessagePicker
          channel="sms"
          form={form}
          shopName={shopName}
          onApplyFields={(fields) => {
            onApplyStarterFields?.(fields)
            onClearErrors?.()
            setMode('scratch')
          }}
        />
      ) : null}

      {mode === 'scratch' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            {!isSms ? (
              <>
                <FormField label="Subject line" error={errors.subject}>
                  <Input
                    value={form.subject}
                    onChange={(event) => onChangeForm({ subject: event.target.value })}
                  />
                </FormField>
                <FormField label="Preview text">
                  <Input
                    value={form.previewText}
                    onChange={(event) => onChangeForm({ previewText: event.target.value })}
                  />
                </FormField>
              </>
            ) : null}

            {isSms || !hasHtmlContent ? (
              <FormField label={isSms ? 'SMS message' : 'Email body'} error={errors.body}>
                <Textarea
                  rows={isSms ? 8 : 12}
                  value={form.body}
                  onChange={(event) => onChangeForm({ body: event.target.value })}
                />
              </FormField>
            ) : (
              <div className="rounded-xl border border-line bg-midnight/40 p-3">
                <p className="text-sm text-muted">
                  The design on the right is your email HTML (sample data:{' '}
                  <span className="font-medium text-ink">{previewShop}</span>, Alex). Editing
                  subject or preview text above does not change that layout — use{' '}
                  <span className="font-medium text-ink">Browse my templates</span> to change the
                  design.
                </p>
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-electric hover:underline"
                  onClick={() => setShowPlainFallback((open) => !open)}
                >
                  {showPlainFallback ? 'Hide plain-text fallback' : 'Show plain-text fallback'}
                </button>
                {showPlainFallback ? (
                  <div className="mt-3 space-y-2">
                    <FormField
                      label="Plain-text fallback"
                      error={errors.body}
                      hint="Only used by email clients that cannot show HTML. It does not update the design preview."
                    >
                      <Textarea
                        rows={6}
                        value={form.body}
                        onChange={(event) => onChangeForm({ body: event.target.value })}
                      />
                    </FormField>
                  </div>
                ) : null}
              </div>
            )}

            {isSms ? (
              <p className="text-xs text-muted">{form.body.length}/160 characters (soft limit)</p>
            ) : null}
          </Card>

          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {isSms ? 'iPhone 16 Pro Max preview' : 'Live preview'}
                </h3>
                {!isSms && form.subject?.trim() ? (
                  <p className="mt-0.5 text-xs text-muted">Subject: {form.subject}</p>
                ) : null}
              </div>
              {!isSms ? (
                <div className="flex items-center rounded-md border border-line bg-midnight p-0.5">
                  <button
                    type="button"
                    aria-label="Desktop preview"
                    aria-pressed={viewport === 'desktop'}
                    onClick={() => setViewport('desktop')}
                    className={cn(
                      'rounded-sm p-1.5 transition-colors',
                      viewport === 'desktop' ? 'bg-secondary text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    <Monitor className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="iPhone 16 Pro Max preview"
                    aria-pressed={viewport === 'mobile'}
                    onClick={() => setViewport('mobile')}
                    className={cn(
                      'rounded-sm p-1.5 transition-colors',
                      viewport === 'mobile' ? 'bg-secondary text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    <Smartphone className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>

            {isSms ? (
              <SmsPhonePreview body={form.body} shopName={shopName} />
            ) : hasHtmlContent ? (
              <EmailHtmlPreview html={previewHtml} viewport={viewport} />
            ) : (
              <div className="rounded-md border border-line bg-midnight p-4">
                <p className="mb-2 text-sm font-semibold text-ink">{form.subject || 'Subject'}</p>
                {form.previewText?.trim() ? (
                  <p className="mb-2 text-xs text-muted">{form.previewText}</p>
                ) : null}
                <pre className="whitespace-pre-wrap font-sans text-sm text-muted">
                  {personalizeMergeTags(form.body || 'Message body', {
                    shopName: previewShop,
                    firstName: 'Alex',
                  })}
                </pre>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {!mode && !(form.body?.trim() || hasHtmlContent) ? (
        <p className="text-sm text-muted">
          {isSms
            ? 'Select Browse my templates or Create new to continue.'
            : 'Browse opens Email Templates and brings you back after you choose. Create new keeps you in this flow.'}
        </p>
      ) : null}
    </div>
  )
}
