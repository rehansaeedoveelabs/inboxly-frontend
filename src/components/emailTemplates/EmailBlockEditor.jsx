import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Minus,
  MousePointerClick,
  Plus,
  Space,
  Trash2,
  Type,
} from 'lucide-react'
import { FormField, Input, Select, Textarea } from '../ui'
import { createEmailBlock, EMAIL_BLOCK_TYPES } from '../../lib/emailTemplatesApi'
import { cn } from '../../lib/cn'

const BLOCK_META = {
  header: { label: 'Header', icon: Type, hint: 'Hero / brand band' },
  text: { label: 'Text', icon: Type, hint: 'Body copy' },
  image: { label: 'Image', icon: ImageIcon, hint: 'From image library' },
  button: { label: 'Button', icon: MousePointerClick, hint: 'Call to action' },
  divider: { label: 'Divider', icon: Minus, hint: 'Horizontal rule' },
  spacer: { label: 'Spacer', icon: Space, hint: 'Vertical gap' },
  footer: { label: 'Footer', icon: Type, hint: 'Legal / unsubscribe' },
}

function AlignControl({ value, onChange }) {
  const options = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ]
  return (
    <div className="flex items-center rounded-lg border border-line bg-midnight p-0.5">
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              active ? 'bg-secondary text-ink' : 'text-muted hover:text-ink',
            )}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}

/**
 * Block-document editor for email templates.
 *
 * @param {{
 *   document: { version: number, settings?: object, blocks: Array<object> },
 *   onChange: (next: object) => void,
 *   assets?: Array<{ id: string, name: string }>,
 * }} props
 */
export function EmailBlockEditor({ document, onChange, assets = [] }) {
  const blocks = Array.isArray(document?.blocks) ? document.blocks : []
  const settings = document?.settings || { width: 600, background: '#ffffff' }

  const updateDocument = (patch) => {
    onChange({
      version: 1,
      settings,
      blocks,
      ...document,
      ...patch,
    })
  }

  const updateBlock = (index, nextBlock) => {
    const nextBlocks = blocks.map((block, i) => (i === index ? nextBlock : block))
    updateDocument({ blocks: nextBlocks })
  }

  const updateProps = (index, propsPatch) => {
    const block = blocks[index]
    updateBlock(index, {
      ...block,
      props: { ...(block.props || {}), ...propsPatch },
    })
  }

  const removeBlock = (index) => {
    updateDocument({ blocks: blocks.filter((_, i) => i !== index) })
  }

  const moveBlock = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    updateDocument({ blocks: next })
  }

  const addBlock = (type) => {
    updateDocument({ blocks: [...blocks, createEmailBlock(type)] })
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-line bg-elevated">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-ink">Canvas</h3>
            <p className="text-xs text-muted">Email width and page background</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium tracking-wide text-muted uppercase">
                Width
              </span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={320}
                  max={800}
                  className="w-[5.5rem]"
                  value={settings.width ?? 600}
                  onChange={(event) =>
                    updateDocument({
                      settings: {
                        ...settings,
                        width: Number(event.target.value) || 600,
                      },
                    })
                  }
                />
                <span className="text-xs text-muted">px</span>
              </div>
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-medium tracking-wide text-muted uppercase">
                Background
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Background color"
                  value={
                    /^#[0-9A-Fa-f]{6}$/.test(settings.background || '')
                      ? settings.background
                      : '#ffffff'
                  }
                  onChange={(event) =>
                    updateDocument({
                      settings: { ...settings, background: event.target.value },
                    })
                  }
                  className="size-9 cursor-pointer rounded-lg border border-line bg-midnight p-1"
                />
                <Input
                  className="w-[7.5rem] font-mono text-xs"
                  value={settings.background ?? '#ffffff'}
                  onChange={(event) =>
                    updateDocument({
                      settings: { ...settings, background: event.target.value },
                    })
                  }
                />
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          {blocks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-midnight/40 px-4 py-10 text-center">
              <p className="text-sm font-medium text-ink">No blocks yet</p>
              <p className="mt-1 text-sm text-muted">Add a header or text block to start the email.</p>
            </div>
          ) : null}

          {blocks.map((block, index) => {
            const meta = BLOCK_META[block.type] || {
              label: block.type,
              icon: Type,
              hint: '',
            }
            const Icon = meta.icon
            const isHtmlBlock =
              block.type === 'text' || block.type === 'header' || block.type === 'footer'

            return (
              <article
                key={block.id || index}
                className="group overflow-hidden rounded-xl border border-line bg-midnight/50 transition-colors hover:border-electric/35"
              >
                <header className="flex items-center gap-2 border-b border-line/80 bg-elevated/60 px-3 py-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-secondary text-ink">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{meta.label}</p>
                    {meta.hint ? <p className="text-[11px] text-muted">{meta.hint}</p> : null}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Move block up"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, -1)}
                      className="rounded-md p-1.5 text-muted hover:bg-secondary hover:text-ink disabled:opacity-30"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move block down"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 1)}
                      className="rounded-md p-1.5 text-muted hover:bg-secondary hover:text-ink disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${meta.label} block`}
                      onClick={() => removeBlock(index)}
                      className="rounded-md p-1.5 text-muted hover:bg-danger/15 hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </header>

                <div className="space-y-3 p-3">
                  {isHtmlBlock ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
                          Content HTML
                        </span>
                        <AlignControl
                          value={block.props?.align || 'left'}
                          onChange={(align) => updateProps(index, { align })}
                        />
                      </div>
                      <Textarea
                        rows={block.type === 'header' ? 6 : 4}
                        value={block.props?.html || ''}
                        onChange={(event) => updateProps(index, { html: event.target.value })}
                        className="font-mono text-[12px] leading-relaxed"
                      />
                    </>
                  ) : null}

                  {block.type === 'image' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField label="Asset" className="sm:col-span-2">
                        <Select
                          value={block.props?.asset_id || ''}
                          onChange={(event) =>
                            updateProps(index, {
                              asset_id: event.target.value || null,
                            })
                          }
                        >
                          <option value="">Select an uploaded image</option>
                          {assets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                      <FormField label="Alt text">
                        <Input
                          value={block.props?.alt || ''}
                          onChange={(event) => updateProps(index, { alt: event.target.value })}
                        />
                      </FormField>
                      <FormField label="Link URL">
                        <Input
                          value={block.props?.href || ''}
                          onChange={(event) =>
                            updateProps(index, {
                              href: event.target.value.trim() || null,
                            })
                          }
                          placeholder="https://"
                        />
                      </FormField>
                    </div>
                  ) : null}

                  {block.type === 'button' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField label="Label">
                        <Input
                          value={block.props?.label || ''}
                          onChange={(event) => updateProps(index, { label: event.target.value })}
                        />
                      </FormField>
                      <FormField label="URL">
                        <Input
                          value={block.props?.href || ''}
                          onChange={(event) => updateProps(index, { href: event.target.value })}
                          placeholder="https://"
                        />
                      </FormField>
                    </div>
                  ) : null}

                  {block.type === 'spacer' ? (
                    <FormField label="Height (px)">
                      <Input
                        type="number"
                        min={8}
                        max={120}
                        className="max-w-[8rem]"
                        value={block.props?.height ?? 24}
                        onChange={(event) =>
                          updateProps(index, {
                            height: Number(event.target.value) || 24,
                          })
                        }
                      />
                    </FormField>
                  ) : null}

                  {block.type === 'divider' ? (
                    <p className="text-sm text-muted">Renders a horizontal rule. No options.</p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-4">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">Add block</h3>
            <p className="text-xs text-muted">Append a section to the bottom of the email</p>
          </div>
          <span className="text-xs tabular-nums text-muted">{blocks.length} blocks</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EMAIL_BLOCK_TYPES.map((type) => {
            const meta = BLOCK_META[type] || { label: type, icon: Plus }
            const Icon = meta.icon
            return (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="flex items-center gap-2 rounded-xl border border-line bg-midnight/40 px-3 py-2.5 text-left transition hover:border-electric/45 hover:bg-electric/10"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated text-ink">
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{meta.label}</span>
                  <span className="block truncate text-[11px] text-muted">{meta.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
