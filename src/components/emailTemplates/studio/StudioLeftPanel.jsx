import { useState } from 'react'
import {
  Braces,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Minus,
  MousePointerClick,
  Pilcrow,
  PanelBottom,
  Space,
} from 'lucide-react'
import { EmailAssetPicker } from '../EmailAssetPicker'
import { cn } from '../../../lib/cn'
import { EMAIL_BLOCK_TYPES } from '../../../lib/emailTemplatesApi'

const RAIL = [
  { id: 'elements', label: 'Elements', icon: LayoutTemplate },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'variables', label: 'Variables', icon: Braces },
]

const CONTENT_BLOCKS = [
  { type: 'header', label: 'Heading', icon: Heading1 },
  { type: 'text', label: 'Paragraph', icon: Pilcrow },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'button', label: 'Button', icon: MousePointerClick },
]

const STRUCTURE_BLOCKS = [
  { type: 'spacer', label: 'Spacer', icon: Space },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'footer', label: 'Footer', icon: PanelBottom },
]

const MERGE_TAGS = [
  { tag: '{{shop_name}}', hint: 'Store name' },
  { tag: '{{first_name}}', hint: 'Contact first name' },
  { tag: '{{discount_code}}', hint: 'Offer code' },
  { tag: '{{address}}', hint: 'Store address' },
  { tag: '{{city}}', hint: 'City' },
  { tag: '{{country}}', hint: 'Country' },
]

const PANEL_COPY = {
  elements: { title: 'Add elements', subtitle: 'Build your email from content blocks' },
  layers: { title: 'Layers', subtitle: 'Drag to reorder · click to edit' },
  images: { title: 'Images', subtitle: 'Drop a file or pick a library image' },
  variables: { title: 'Variables', subtitle: 'Personalize with merge tags' },
}

function ElementTile({ label, icon: Icon, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2.5 rounded-xl border border-line bg-elevated px-2 py-3.5 text-center transition duration-150',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:-translate-y-0.5 hover:border-electric/45 hover:bg-electric/5 active:translate-y-0',
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-lg border border-dashed border-line bg-midnight text-ink transition group-hover:border-electric/40 group-hover:text-electric">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-ink">{label}</span>
    </button>
  )
}

/**
 * Left rail + element library for the template studio.
 */
export function StudioLeftPanel({
  rail,
  onRailChange,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  assets = [],
  assetsLoading = false,
  assetsError = '',
  assetUploading = false,
  selectedAssetId = null,
  onPickAsset,
  onUploadAsset,
  onRefreshAssets,
  onReorderBlocks,
}) {
  const copy = PANEL_COPY[rail] || PANEL_COPY.elements
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId)
  const pickingForImageBlock = selectedBlock?.type === 'image'
  const [dragIndex, setDragIndex] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)

  const finishLayerDrag = (toIndex) => {
    if (dragIndex == null || toIndex == null || dragIndex === toIndex) {
      setDragIndex(null)
      setDropIndex(null)
      return
    }
    onReorderBlocks?.(dragIndex, toIndex)
    setDragIndex(null)
    setDropIndex(null)
  }

  return (
    <div className="flex h-full min-h-0 border-r border-line bg-elevated">
      <nav className="flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-line bg-midnight py-3">
        {RAIL.map((item) => {
          const Icon = item.icon
          const active = rail === item.id
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => onRailChange(item.id)}
              className={cn(
                'relative flex size-9 items-center justify-center rounded-lg transition duration-150',
                active
                  ? 'bg-electric/15 text-electric'
                  : 'text-muted hover:bg-secondary hover:text-ink',
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-electric" />
              ) : null}
              <Icon className="size-4" strokeWidth={1.75} />
            </button>
          )
        })}
      </nav>

      <div className="flex min-h-0 w-[272px] flex-1 flex-col">
        <div className="border-b border-line px-4 py-3.5">
          <p className="text-[13px] font-semibold tracking-tight text-ink">{copy.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{copy.subtitle}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {rail === 'elements' ? (
            <div className="space-y-5">
              <section>
                <p className="mb-2.5 px-0.5 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                  Content
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_BLOCKS.map((item) => (
                    <ElementTile
                      key={item.type}
                      label={item.label}
                      icon={item.icon}
                      onClick={() => onAddBlock(item.type)}
                    />
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2.5 px-0.5 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                  Structure
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STRUCTURE_BLOCKS.map((item) => (
                    <ElementTile
                      key={item.type}
                      label={item.label}
                      icon={item.icon}
                      onClick={() => onAddBlock(item.type)}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {rail === 'layers' ? (
            <ul className="space-y-1">
              {blocks.length === 0 ? (
                <li className="rounded-xl border border-dashed border-line px-3 py-8 text-center">
                  <p className="text-sm text-muted">No blocks yet</p>
                  <p className="mt-1 text-[11px] text-muted/80">Add one from Elements</p>
                </li>
              ) : null}
              {blocks.map((block, index) => {
                const active = selectedBlockId === block.id
                const allowed = EMAIL_BLOCK_TYPES.includes(block.type)
                const isDropTarget = dropIndex === index && dragIndex !== index
                return (
                  <li
                    key={block.id || index}
                    onDragOver={(event) => {
                      if (dragIndex == null) return
                      event.preventDefault()
                      setDropIndex(index)
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      finishLayerDrag(index)
                    }}
                  >
                    <div
                      draggable={allowed && Boolean(onReorderBlocks)}
                      onDragStart={() => setDragIndex(index)}
                      onDragEnd={() => {
                        setDragIndex(null)
                        setDropIndex(null)
                      }}
                      className={cn(
                        'flex w-full items-center gap-1 rounded-lg transition',
                        isDropTarget ? 'ring-1 ring-electric/50' : null,
                        dragIndex === index ? 'opacity-50' : null,
                      )}
                    >
                      <span
                        className="flex shrink-0 cursor-grab items-center px-1 text-muted active:cursor-grabbing"
                        title="Drag to reorder"
                        aria-hidden
                      >
                        <GripVertical className="size-3.5" />
                      </span>
                      <button
                        type="button"
                        disabled={!allowed}
                        onClick={() => onSelectBlock(block.id)}
                        className={cn(
                          'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] transition',
                          active
                            ? 'bg-electric/12 font-medium text-ink ring-1 ring-electric/30'
                            : 'text-muted hover:bg-secondary hover:text-ink',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums',
                            active ? 'bg-electric/25 text-electric' : 'bg-secondary text-muted',
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 capitalize">{block.type}</span>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : null}

          {rail === 'images' ? (
            <div className="space-y-3 px-0.5">
              <p className="text-[12px] leading-relaxed text-muted">
                {pickingForImageBlock
                  ? 'Drop a file onto the zone, or click a library thumbnail to apply it.'
                  : 'Drop a file here — we’ll add an Image block. Or pick a library thumbnail.'}
              </p>
              <EmailAssetPicker
                compact
                assets={assets}
                value={selectedAssetId}
                loading={assetsLoading}
                error={assetsError}
                uploading={assetUploading}
                onSelect={onPickAsset}
                onUpload={onUploadAsset}
                onRefresh={onRefreshAssets}
                emptyHint="Upload an image here to use it in your email."
              />
            </div>
          ) : null}

          {rail === 'variables' ? (
            <ul className="space-y-1.5">
              {MERGE_TAGS.map((item) => (
                <li key={item.tag} className="rounded-lg border border-line bg-elevated px-3 py-2.5">
                  <code className="text-[12px] font-semibold text-electric">{item.tag}</code>
                  <p className="mt-0.5 text-[11px] text-muted">{item.hint}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
