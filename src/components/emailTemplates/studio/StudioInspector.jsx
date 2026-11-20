import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react'
import { FormField, Input, Select, Textarea } from '../../ui'
import { EmailAssetPicker } from '../EmailAssetPicker'
import { EmailProductPicker } from '../EmailProductPicker'
import { productBlockPropsFromShopifyProduct } from '../../../lib/shopifyProductsApi'
import { cn } from '../../../lib/cn'

function AlignControl({ value, onChange }) {
  const options = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ]
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-midnight p-0.5">
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

function ColorField({ label, value, onChange, hint, onReset }) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value || '') ? value : '#ffffff'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-ink">{label}</span>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-muted transition hover:text-ink"
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-line bg-midnight p-1"
        />
        <Input
          className="h-9 font-mono text-[12px]"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {hint ? <p className="text-[11px] leading-snug text-muted">{hint}</p> : null}
    </div>
  )
}

function Section({ title, children, defaultOpen = true }) {
  return (
    <details open={defaultOpen} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[13px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-3.5 text-muted transition duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-4 px-4 pb-4">{children}</div>
    </details>
  )
}

/**
 * Right inspector: body settings or selected block settings.
 */
export function StudioInspector({
  settings,
  block,
  blockIndex,
  blockCount,
  assets,
  assetsLoading = false,
  assetsError = '',
  assetUploading = false,
  products = [],
  productsLoading = false,
  productsError = '',
  onUpdateSettings,
  onUpdateBlockProps,
  onMoveBlock,
  onRemoveBlock,
  onClearSelection,
  onUploadAsset,
  onRefreshAssets,
  onRefreshProducts,
}) {
  if (!block) {
    return (
      <aside className="flex h-full min-h-0 w-[300px] shrink-0 flex-col border-l border-line bg-elevated">
        <div className="border-b border-line px-4 py-3.5">
          <p className="text-[13px] font-semibold tracking-tight text-ink">Body settings</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            Background, width, and defaults for this template.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <Section title="General settings">
            <ColorField
              label="Background color"
              value={settings.background || '#f7f5f2'}
              onChange={(background) => onUpdateSettings({ background })}
              onReset={() => onUpdateSettings({ background: '#f7f5f2' })}
            />
            <FormField
              label="Content width"
              hint="Recommended 600–700px for most inboxes."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={320}
                  max={800}
                  className="h-9"
                  value={settings.width ?? 600}
                  onChange={(event) =>
                    onUpdateSettings({ width: Number(event.target.value) || 600 })
                  }
                />
                <span className="text-[11px] text-muted">px</span>
              </div>
            </FormField>
            <FormField label="Default font">
              <Select
                className="h-9"
                value={settings.fontFamily || 'default'}
                onChange={(event) =>
                  onUpdateSettings({
                    fontFamily: event.target.value === 'default' ? undefined : event.target.value,
                  })
                }
              >
                <option value="default">Default (system)</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'DM Sans', Helvetica, sans-serif">DM Sans</option>
              </Select>
            </FormField>
            <ColorField
              label="Link color"
              value={settings.linkColor || '#2878FF'}
              onChange={(linkColor) => onUpdateSettings({ linkColor })}
              onReset={() => onUpdateSettings({ linkColor: '#2878FF' })}
              hint="Design note — button colors stay in each block."
            />
          </Section>
          <Section title="Inbox & SEO" defaultOpen={false}>
            <p className="text-[12px] leading-relaxed text-muted">
              Subject and preheader sit above the canvas. They save with this template and seed a
              campaign when you apply it.
            </p>
          </Section>
        </div>
      </aside>
    )
  }

  const typeLabel = String(block.type || 'block')
  const isHtml = block.type === 'text' || block.type === 'header' || block.type === 'footer'

  return (
    <aside className="flex h-full min-h-0 w-[300px] shrink-0 flex-col border-l border-line bg-elevated">
      <div className="flex items-start justify-between gap-2 border-b border-line px-4 py-3.5">
        <div>
          <p className="text-[13px] font-semibold capitalize tracking-tight text-ink">
            {typeLabel} settings
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            Block {blockIndex + 1} of {blockCount}
          </p>
        </div>
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded-md px-2 py-1 text-[11px] font-semibold text-electric transition hover:bg-electric/10"
        >
          Body
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-b border-line px-2.5 py-1.5">
        <button
          type="button"
          aria-label="Move up"
          disabled={blockIndex <= 0}
          onClick={() => onMoveBlock(-1)}
          className="rounded-md p-1.5 text-muted transition hover:bg-secondary hover:text-ink disabled:opacity-25"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Move down"
          disabled={blockIndex >= blockCount - 1}
          onClick={() => onMoveBlock(1)}
          className="rounded-md p-1.5 text-muted transition hover:bg-secondary hover:text-ink disabled:opacity-25"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete block"
          onClick={onRemoveBlock}
          className="ml-auto rounded-md p-1.5 text-muted transition hover:bg-danger/15 hover:text-danger"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {isHtml ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-ink">Alignment</span>
              <AlignControl
                value={block.props?.align || 'left'}
                onChange={(align) => onUpdateBlockProps({ align })}
              />
            </div>
            <FormField label="HTML content">
              <Textarea
                rows={11}
                value={block.props?.html || ''}
                onChange={(event) => onUpdateBlockProps({ html: event.target.value })}
                className="min-h-[220px] font-mono text-[12px] leading-relaxed"
              />
            </FormField>
          </>
        ) : null}

        {block.type === 'image' ? (
          <>
            {!block.props?.asset_id ? (
              <p
                className="rounded-lg border border-cantaloupe/40 bg-cantaloupe/10 px-3 py-2 text-[11px] leading-relaxed text-cantaloupe-ink"
                role="status"
              >
                This Image block is empty — that is why nothing shows in the preview. Click the
                library thumbnail below (or drop a file) to apply it, then Save template.
              </p>
            ) : (
              <p className="rounded-lg border border-line bg-midnight/50 px-3 py-2 text-[11px] leading-relaxed text-muted">
                Drop a file or click a thumbnail to change the image. Drag the Image layer in Layers
                to place it, or use ↑ / ↓ here.
              </p>
            )}
            <EmailAssetPicker
              assets={assets}
              value={block.props?.asset_id || null}
              loading={assetsLoading}
              error={assetsError}
              uploading={assetUploading}
              onSelect={(assetId) => {
                const asset = assets.find((row) => row.id === assetId)
                onUpdateBlockProps({
                  asset_id: assetId,
                  ...(asset?.alt && !block.props?.alt ? { alt: asset.alt } : {}),
                })
              }}
              onUpload={onUploadAsset}
              onRefresh={onRefreshAssets}
            />
            <FormField label="Alt text">
              <Input
                className="h-9"
                value={block.props?.alt || ''}
                onChange={(event) => onUpdateBlockProps({ alt: event.target.value })}
              />
            </FormField>
            <FormField label="Link URL">
              <Input
                className="h-9"
                value={block.props?.href || ''}
                onChange={(event) =>
                  onUpdateBlockProps({ href: event.target.value.trim() || null })
                }
                placeholder="https://"
              />
            </FormField>
          </>
        ) : null}

        {block.type === 'product' ? (
          <>
            {!block.props?.shopify_product_id ? (
              <p
                className="rounded-lg border border-cantaloupe/40 bg-cantaloupe/10 px-3 py-2 text-[11px] leading-relaxed text-cantaloupe-ink"
                role="status"
              >
                Pick a synced Shopify product to show its featured image, title, and shop link in
                the email.
              </p>
            ) : (
              <p className="rounded-lg border border-line bg-midnight/50 px-3 py-2 text-[11px] leading-relaxed text-muted">
                Product media comes from Shopify commerce sync. Re-sync in Storefront settings if an
                image looks outdated.
              </p>
            )}
            <EmailProductPicker
              products={products}
              value={block.props?.shopify_product_id || null}
              loading={productsLoading}
              error={productsError}
              onRefresh={onRefreshProducts}
              onSelect={(product) => {
                onUpdateBlockProps({
                  ...productBlockPropsFromShopifyProduct(product),
                  button_label: block.props?.button_label || 'Shop now',
                  show_title: block.props?.show_title !== false,
                  show_price: block.props?.show_price !== false,
                  show_button: block.props?.show_button !== false,
                })
              }}
            />
            <FormField label="Button label">
              <Input
                className="h-9"
                value={block.props?.button_label || 'Shop now'}
                onChange={(event) => onUpdateBlockProps({ button_label: event.target.value })}
              />
            </FormField>
            <label className="flex items-center gap-2 text-[12px] text-ink">
              <input
                type="checkbox"
                checked={block.props?.show_title !== false}
                onChange={(event) => onUpdateBlockProps({ show_title: event.target.checked })}
              />
              Show product title
            </label>
            <label className="flex items-center gap-2 text-[12px] text-ink">
              <input
                type="checkbox"
                checked={block.props?.show_price !== false}
                onChange={(event) => onUpdateBlockProps({ show_price: event.target.checked })}
              />
              Show price
            </label>
            <label className="flex items-center gap-2 text-[12px] text-ink">
              <input
                type="checkbox"
                checked={block.props?.show_button !== false}
                onChange={(event) => onUpdateBlockProps({ show_button: event.target.checked })}
              />
              Show shop button
            </label>
            {block.props?.price ? (
              <p className="text-[11px] text-muted">
                Price:{' '}
                {[block.props.currency_code, block.props.price].filter(Boolean).join(' ')}
              </p>
            ) : null}
            {block.props?.product_url ? (
              <p className="break-all text-[10px] text-muted">Link: {block.props.product_url}</p>
            ) : null}
          </>
        ) : null}

        {block.type === 'button' ? (
          <>
            <FormField label="Label">
              <Input
                className="h-9"
                value={block.props?.label || ''}
                onChange={(event) => onUpdateBlockProps({ label: event.target.value })}
              />
            </FormField>
            <FormField label="URL">
              <Input
                className="h-9"
                value={block.props?.href || ''}
                onChange={(event) => onUpdateBlockProps({ href: event.target.value })}
                placeholder="https://"
              />
            </FormField>
          </>
        ) : null}

        {block.type === 'spacer' ? (
          <FormField label="Height (px)">
            <Input
              type="number"
              min={8}
              max={120}
              className="h-9 max-w-[7rem]"
              value={block.props?.height ?? 24}
              onChange={(event) =>
                onUpdateBlockProps({ height: Number(event.target.value) || 24 })
              }
            />
          </FormField>
        ) : null}

        {block.type === 'divider' ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-[12px] text-muted">
            Horizontal rule — no extra options.
          </p>
        ) : null}
      </div>
    </aside>
  )
}
