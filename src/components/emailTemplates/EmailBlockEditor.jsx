import { Plus, Trash2 } from 'lucide-react'
import { Button, Card, FormField, Input, Select, Textarea } from '../ui'
import { createEmailBlock, EMAIL_BLOCK_TYPES } from '../../lib/emailTemplatesApi'

/**
 * Lightweight block-document editor (Phase 8). Product blocks are not offered.
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

  const addBlock = (type) => {
    updateDocument({ blocks: [...blocks, createEmailBlock(type)] })
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Canvas</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Width (px)">
            <Input
              type="number"
              min={320}
              max={800}
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
          </FormField>
          <FormField label="Background">
            <Input
              value={settings.background ?? '#ffffff'}
              onChange={(event) =>
                updateDocument({
                  settings: { ...settings, background: event.target.value },
                })
              }
            />
          </FormField>
        </div>
      </Card>

      {blocks.map((block, index) => (
        <Card key={block.id || index} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold capitalize text-ink">{block.type}</p>
            <Button variant="ghost" onClick={() => removeBlock(index)} aria-label="Remove block">
              <Trash2 className="size-4" />
            </Button>
          </div>

          {block.type === 'text' || block.type === 'header' || block.type === 'footer' ? (
            <>
              <FormField label="HTML">
                <Textarea
                  rows={4}
                  value={block.props?.html || ''}
                  onChange={(event) => updateProps(index, { html: event.target.value })}
                />
              </FormField>
              <FormField label="Align">
                <Select
                  value={block.props?.align || 'left'}
                  onChange={(event) => updateProps(index, { align: event.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </Select>
              </FormField>
            </>
          ) : null}

          {block.type === 'image' ? (
            <>
              <FormField label="Asset">
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
              <FormField label="Link URL (optional)">
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
            </>
          ) : null}

          {block.type === 'button' ? (
            <>
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
            </>
          ) : null}

          {block.type === 'spacer' ? (
            <FormField label="Height (px)">
              <Input
                type="number"
                min={8}
                max={120}
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
            <p className="text-sm text-muted">Horizontal rule — no options.</p>
          ) : null}
        </Card>
      ))}

      <Card className="space-y-2">
        <p className="text-sm font-semibold text-ink">Add block</p>
        <div className="flex flex-wrap gap-2">
          {EMAIL_BLOCK_TYPES.map((type) => (
            <Button key={type} variant="secondary" onClick={() => addBlock(type)}>
              <Plus className="size-4" />
              {type}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
