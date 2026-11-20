import {
  CalendarClock,
  ChevronRight,
  ExternalLink,
  Eye,
  FlaskConical,
  Link2,
  MonitorSmartphone,
  Target,
  Tags,
  Timer,
} from 'lucide-react'
import { EmailAssetPicker } from '../../emailTemplates/EmailAssetPicker'
import { cn } from '../../../lib/cn'

const BEHAVIOR_ROWS = [
  {
    id: 'install',
    icon: Link2,
    title: 'Install on your store',
    hint: 'Copy embed code',
  },
  {
    id: 'audience',
    icon: Tags,
    title: 'Audience management',
    hintKey: 'tags',
  },
  {
    id: 'scheduling',
    icon: CalendarClock,
    title: 'Scheduling',
    hintKey: 'scheduling',
  },
  {
    id: 'display',
    icon: Timer,
    title: 'Display',
    badge: 'New',
    hintKey: 'display',
  },
  {
    id: 'targeting',
    icon: Target,
    title: 'Targeting',
    hintKey: 'targeting',
  },
  {
    id: 'visibility',
    icon: MonitorSmartphone,
    title: 'Visibility',
    hintKey: 'devices',
  },
  {
    id: 'frequency',
    icon: Eye,
    title: 'Frequency',
    hintKey: 'frequency',
  },
  {
    id: 'redirect',
    icon: Link2,
    title: 'Redirect after submission',
    hintKey: 'redirect',
  },
  {
    id: 'ab',
    icon: FlaskConical,
    title: 'A/B test',
    hint: 'Start A/B testing with a single click',
    external: true,
  },
]

const DISPLAY_OPTIONS = [
  'After spending 5 sec on the page',
  'After 8 seconds',
  'On exit intent',
  'Always visible',
]
const DEVICE_OPTIONS = ['Show on all devices', 'Desktop only', 'Mobile only', 'Desktop & mobile']
const FREQUENCY_OPTIONS = ['Show after 1 day', 'Once every 14 days', 'Once per session', 'N/A']
const SCHEDULING_OPTIONS = ['Always available', 'Date range']
const TARGETING_OPTIONS = ['All visitors', 'New visitors', 'Returning visitors']
const REDIRECT_OPTIONS = ['Stay on page', 'Redirect to URL']

export function FormStudioInspector({
  tab,
  onTabChange,
  form,
  selectedField,
  selectedFieldId,
  contentSelected,
  openSection,
  onOpenSection,
  onPatchForm,
  onPatchField,
  onPatchBehavior,
  onPatchTheme,
  onPatchSuccess,
  onRemoveField,
  assets = [],
  assetsLoading = false,
  assetsError = '',
  assetUploading = false,
  onUploadAsset,
  onRefreshAssets,
}) {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l border-[#2a2a2a] bg-[#1a1a1a] text-white">
      <div className="flex border-b border-[#2a2a2a]">
        {[
          { id: 'behavior', label: 'Behavior' },
          { id: 'theme', label: 'Theme settings' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex-1 px-3 py-3 text-[13px] font-medium transition',
              tab === item.id
                ? 'border-b-2 border-[#14b8a6] text-white'
                : 'text-[#9a9a9a] hover:text-white',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'behavior' ? (
          <div>
            {BEHAVIOR_ROWS.map((row) => {
              const Icon = row.icon
              const open = openSection === row.id
              const hint =
                row.hint ||
                (row.hintKey === 'tags'
                  ? (form.tags || []).join(', ') || 'No tags'
                  : form.behavior?.[row.hintKey] || '')

              return (
                <div key={row.id} className="border-b border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={() => onOpenSection(open ? null : row.id)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-[#222]"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-[#9a9a9a]" strokeWidth={1.5} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">{row.title}</span>
                        {row.badge ? (
                          <span className="rounded bg-[#14b8a6]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#5eead4]">
                            {row.badge}
                          </span>
                        ) : null}
                        {row.external ? <ExternalLink className="size-3 text-[#9a9a9a]" /> : null}
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-[#8a8a8a]">{hint}</p>
                    </div>
                    <ChevronRight
                      className={cn(
                        'mt-0.5 size-4 shrink-0 text-[#6a6a6a] transition',
                        open && 'rotate-90',
                      )}
                    />
                  </button>

                  {open && row.id !== 'ab' ? (
                    <div className="space-y-2 border-t border-[#2a2a2a] bg-[#151515] px-4 py-3">
                      {row.id === 'install' ? (
                        <FormInstallPanel form={form} />
                      ) : null}
                      {row.id === 'audience' ? (
                        <input
                          value={(form.tags || []).join(', ')}
                          onChange={(event) =>
                            onPatchForm({
                              tags: event.target.value
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean),
                            })
                          }
                          className="h-9 w-full rounded-md border border-[#333] bg-[#222] px-3 text-[12px] text-white outline-none focus:border-[#14b8a6]"
                          placeholder="form_subscriber, branded_wof"
                        />
                      ) : null}
                      {row.id === 'scheduling' ? (
                        <Select
                          value={form.behavior?.scheduling}
                          options={SCHEDULING_OPTIONS}
                          onChange={(value) => onPatchBehavior({ scheduling: value })}
                        />
                      ) : null}
                      {row.id === 'display' ? (
                        <Select
                          value={form.behavior?.display}
                          options={DISPLAY_OPTIONS}
                          onChange={(value) => onPatchBehavior({ display: value })}
                        />
                      ) : null}
                      {row.id === 'targeting' ? (
                        <Select
                          value={form.behavior?.targeting}
                          options={TARGETING_OPTIONS}
                          onChange={(value) => onPatchBehavior({ targeting: value })}
                        />
                      ) : null}
                      {row.id === 'visibility' ? (
                        <Select
                          value={form.behavior?.devices}
                          options={DEVICE_OPTIONS}
                          onChange={(value) => onPatchBehavior({ devices: value })}
                        />
                      ) : null}
                      {row.id === 'frequency' ? (
                        <Select
                          value={form.behavior?.frequency}
                          options={FREQUENCY_OPTIONS}
                          onChange={(value) => onPatchBehavior({ frequency: value })}
                        />
                      ) : null}
                      {row.id === 'redirect' ? (
                        <Select
                          value={form.behavior?.redirect}
                          options={REDIRECT_OPTIONS}
                          onChange={(value) => onPatchBehavior({ redirect: value })}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <Field label="Accent">
              <ColorInput
                value={form.theme?.accent}
                onChange={(value) => onPatchTheme({ accent: value })}
              />
            </Field>
            <Field label="Background">
              <ColorInput
                value={form.theme?.background}
                onChange={(value) => onPatchTheme({ background: value })}
              />
            </Field>
            <Field label="Text">
              <ColorInput
                value={form.theme?.text}
                onChange={(value) => onPatchTheme({ text: value })}
              />
            </Field>
            <Field label="Format">
              <Select
                value={form.type}
                options={[
                  'popup',
                  'embedded',
                  'landing_page',
                  'flyout',
                  'fullscreen',
                ]}
                labels={{
                  popup: 'Popup',
                  embedded: 'Embedded',
                  landing_page: 'Landing page',
                  flyout: 'Flyout',
                  fullscreen: 'Fullscreen',
                }}
                onChange={(value) => onPatchForm({ type: value })}
              />
            </Field>
            <Field label="Layout">
              <Select
                value={form.layout || 'stack'}
                options={['stack', 'split']}
                labels={{ stack: 'Single column', split: 'Split (content + media)' }}
                onChange={(value) => onPatchForm({ layout: value })}
              />
            </Field>
          </div>
        )}

        {(selectedField || contentSelected || selectedFieldId === '__button__') && tab === 'theme' ? (
          <div className="border-t border-[#2a2a2a] p-4">
            <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#8a8a8a] uppercase">
              Selected
            </p>
            {contentSelected === 'headline' || contentSelected === 'subheadline' ? (
              <div className="space-y-3">
                <Field label="Headline">
                  <input
                    value={form.headline}
                    onChange={(event) => onPatchForm({ headline: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Subheadline">
                  <textarea
                    value={form.subheadline}
                    onChange={(event) => onPatchForm({ subheadline: event.target.value })}
                    className={cn(inputClass, 'h-20 py-2')}
                  />
                </Field>
              </div>
            ) : null}
            {selectedFieldId === '__button__' ? (
              <Field label="Button label">
                <input
                  value={form.buttonLabel}
                  onChange={(event) => onPatchForm({ buttonLabel: event.target.value })}
                  className={inputClass}
                />
              </Field>
            ) : null}
            {selectedField ? (
              <div className="space-y-3">
                <Field label="Label">
                  <input
                    value={selectedField.label}
                    onChange={(event) => onPatchField(selectedField.id, { label: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                {selectedField.type === 'image' ? (
                  <div className="space-y-3">
                    <EmailAssetPicker
                      assets={assets}
                      value={selectedField.props?.asset_id || null}
                      loading={assetsLoading}
                      error={assetsError}
                      uploading={assetUploading}
                      emptyHint="Drop or pick an image for this form."
                      compact
                      onSelect={(assetId) => {
                        onPatchField(selectedField.id, {
                          props: {
                            ...(selectedField.props || {}),
                            asset_id: assetId,
                            src: null,
                          },
                        })
                      }}
                      onUpload={onUploadAsset}
                      onRefresh={onRefreshAssets}
                    />
                    <Field label="Or image URL">
                      <input
                        value={selectedField.props?.src || ''}
                        onChange={(event) =>
                          onPatchField(selectedField.id, {
                            props: {
                              ...(selectedField.props || {}),
                              src: event.target.value.trim() || null,
                              asset_id: event.target.value.trim()
                                ? null
                                : selectedField.props?.asset_id || null,
                            },
                          })
                        }
                        className={inputClass}
                        placeholder="https://"
                      />
                    </Field>
                    <Field label="Alt text">
                      <input
                        value={selectedField.props?.alt || ''}
                        onChange={(event) =>
                          onPatchField(selectedField.id, {
                            props: {
                              ...(selectedField.props || {}),
                              alt: event.target.value,
                            },
                          })
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : null}
                {selectedField.type !== 'image' && 'required' in selectedField ? (
                  <label className="flex items-center gap-2 text-[12px] text-[#cfcfcf]">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedField.required)}
                      onChange={(event) =>
                        onPatchField(selectedField.id, { required: event.target.checked })
                      }
                    />
                    Required
                  </label>
                ) : null}
                <button
                  type="button"
                  onClick={() => onRemoveField(selectedField.id)}
                  className="text-[12px] text-[#f87171] hover:underline"
                >
                  Remove item
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === 'theme' ? (
          <div className="border-t border-[#2a2a2a] p-4">
            <p className="mb-3 text-[11px] font-semibold tracking-wide text-[#8a8a8a] uppercase">
              Success step
            </p>
            <div className="space-y-3">
              <Field label="Headline">
                <input
                  value={form.success?.headline || ''}
                  onChange={(event) => onPatchSuccess({ headline: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Subheadline">
                <textarea
                  value={form.success?.subheadline || ''}
                  onChange={(event) => onPatchSuccess({ subheadline: event.target.value })}
                  className={cn(inputClass, 'h-20 py-2')}
                />
              </Field>
              <Field label="Button">
                <input
                  value={form.success?.buttonLabel || ''}
                  onChange={(event) => onPatchSuccess({ buttonLabel: event.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

const inputClass =
  'h-9 w-full rounded-md border border-[#333] bg-[#222] px-3 text-[12px] text-white outline-none focus:border-[#14b8a6]'

function FormInstallPanel({ form }) {
  const enabled = form.status === 'enabled'
  const embedUrl = form.embedUrl || ''
  const snippet = embedUrl
    ? `<iframe src="${embedUrl}" title="${form.name || 'Inboxly form'}" style="width:100%;min-height:520px;border:0;" loading="lazy"></iframe>`
    : ''

  const copy = async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore — merchant can select manually
    }
  }

  if (!form.id) {
    return (
      <p className="text-[12px] leading-relaxed text-[#9a9a9a]">
        Save this form first, then enable it to get an install link.
      </p>
    )
  }

  if (!enabled || !embedUrl) {
    return (
      <p className="text-[12px] leading-relaxed text-[#9a9a9a]">
        Enable the form (top bar) to unlock the public embed URL. Draft forms stay private.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed text-[#9a9a9a]">
        Paste this into a Shopify page, Custom Liquid section, or any site that supports iframes.
      </p>
      <Field label="Embed URL">
        <div className="flex gap-2">
          <input readOnly value={embedUrl} className={inputClass} />
          <button
            type="button"
            onClick={() => copy(embedUrl)}
            className="shrink-0 rounded-md border border-[#333] px-2 text-[11px] text-[#5eead4] hover:border-[#14b8a6]"
          >
            Copy
          </button>
        </div>
      </Field>
      <Field label="Iframe snippet">
        <textarea readOnly value={snippet} rows={4} className={cn(inputClass, 'h-auto py-2 font-mono text-[11px]')} />
        <button
          type="button"
          onClick={() => copy(snippet)}
          className="mt-2 rounded-md border border-[#333] px-2 py-1 text-[11px] text-[#5eead4] hover:border-[#14b8a6]"
        >
          Copy snippet
        </button>
      </Field>
      <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-[#8a8a8a]">
        <li>In Shopify admin: Online Store → Themes → Customize (or Edit code).</li>
        <li>Add a Custom Liquid / HTML block on a page or theme section.</li>
        <li>Paste the iframe snippet and save.</li>
        <li>Open the page on your storefront to confirm the form loads.</li>
      </ol>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-medium text-[#9a9a9a]">{label}</span>
      {children}
    </label>
  )
}

function Select({ value, options, labels, onChange }) {
  return (
    <select
      value={value || options[0]}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels?.[option] || option}
        </option>
      ))}
    </select>
  )
}

function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={safeColor(value)}
        onChange={(event) => onChange(event.target.value)}
        className="size-9 cursor-pointer rounded border border-[#333] bg-transparent"
      />
      <input
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  )
}

function safeColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value || '') ? value : '#2878FF'
}
