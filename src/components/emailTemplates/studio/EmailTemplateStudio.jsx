import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Code2,
  Eye,
  Monitor,
  Redo2,
  RefreshCw,
  Save,
  Smartphone,
  Tablet,
  Undo2,
  X,
} from 'lucide-react'
import { Button } from '../../ui'
import { EmailHtmlPreview } from '../EmailHtmlPreview'
import { StudioLeftPanel } from './StudioLeftPanel'
import { StudioInspector } from './StudioInspector'
import { createEmailBlock } from '../../../lib/emailTemplatesApi'
import { cn } from '../../../lib/cn'

const HISTORY_LIMIT = 40

function cloneDocument(doc) {
  return structuredClone(doc)
}

/**
 * Full-screen email template studio (three-pane layout).
 * Uses theme tokens so light/dark mode stay consistent.
 */
export function EmailTemplateStudio({
  name,
  onNameChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  document: emailDocument,
  onDocumentChange,
  previewHtml,
  previewLoading = false,
  previewError = '',
  shopName,
  assets = [],
  assetsLoading = false,
  assetsError = '',
  assetUploading = false,
  saving = false,
  savedFlash = false,
  pickingForCampaign = false,
  usingInCampaign = false,
  onClose,
  onSave,
  onUseInCampaign,
  onRefreshPreview,
  onUploadAsset,
  onRefreshAssets,
  onDelete,
  nameError,
  actionError,
}) {
  const [rail, setRail] = useState('elements')
  const [viewport, setViewport] = useState('desktop')
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [showCode, setShowCode] = useState(false)
  const [historyTick, setHistoryTick] = useState(0)

  const historyRef = useRef({ past: [], future: [] })
  const skipHistoryRef = useRef(false)
  const documentRef = useRef(emailDocument)
  const onSaveRef = useRef(onSave)
  documentRef.current = emailDocument
  onSaveRef.current = onSave

  const settings = emailDocument?.settings || { width: 600, background: '#ffffff' }
  const blocks = Array.isArray(emailDocument?.blocks) ? emailDocument.blocks : []
  const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId)
  const selectedBlock = selectedIndex >= 0 ? blocks[selectedIndex] : null

  const subject = typeof settings.subject === 'string' ? settings.subject : ''
  const preheader = typeof settings.preheader === 'string' ? settings.preheader : ''

  const bumpHistory = useCallback(() => setHistoryTick((value) => value + 1), [])

  const pushHistory = useCallback(
    (prevDoc) => {
      const hist = historyRef.current
      hist.past.push(cloneDocument(prevDoc))
      if (hist.past.length > HISTORY_LIMIT) hist.past.shift()
      hist.future = []
      bumpHistory()
    },
    [bumpHistory],
  )

  const commitDocument = useCallback(
    (updater) => {
      const prev = documentRef.current
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!skipHistoryRef.current) pushHistory(prev)
      onDocumentChange(next)
    },
    [onDocumentChange, pushHistory],
  )

  const updateSettings = (patch) => {
    commitDocument((current) => ({
      ...current,
      version: 1,
      settings: { ...(current.settings || {}), ...patch },
      blocks: Array.isArray(current.blocks) ? current.blocks : [],
    }))
  }

  const updateBlocks = (nextBlocks) => {
    commitDocument((current) => ({
      ...current,
      version: 1,
      settings: current.settings || settings,
      blocks: nextBlocks,
    }))
  }

  const addBlock = (type) => {
    const block = createEmailBlock(type)
    updateBlocks([...blocks, block])
    setSelectedBlockId(block.id)
    setRail('layers')
  }

  const updateBlockProps = (propsPatch) => {
    if (selectedIndex < 0) return
    const next = blocks.map((block, index) =>
      index === selectedIndex
        ? { ...block, props: { ...(block.props || {}), ...propsPatch } }
        : block,
    )
    updateBlocks(next)
  }

  const pickAsset = (assetId) => {
    const asset = assets.find((row) => row.id === assetId) || null
    if (selectedBlock?.type === 'image') {
      updateBlockProps({
        asset_id: assetId,
        ...(asset?.alt && !selectedBlock.props?.alt ? { alt: asset.alt } : {}),
      })
      return
    }

    if (!assetId) return

    const block = createEmailBlock('image')
    block.props = {
      ...(block.props || {}),
      asset_id: assetId,
      alt: asset?.alt || '',
    }
    updateBlocks([...blocks, block])
    setSelectedBlockId(block.id)
    setRail('layers')
  }

  const moveSelected = (direction) => {
    if (selectedIndex < 0) return
    const target = selectedIndex + direction
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    const [item] = next.splice(selectedIndex, 1)
    next.splice(target, 0, item)
    updateBlocks(next)
  }

  const reorderBlocks = (fromIndex, toIndex) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= blocks.length ||
      toIndex >= blocks.length ||
      fromIndex === toIndex
    ) {
      return
    }
    const next = [...blocks]
    const [item] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, item)
    updateBlocks(next)
    if (item?.id) setSelectedBlockId(item.id)
  }

  const removeSelected = () => {
    if (selectedIndex < 0) return
    updateBlocks(blocks.filter((_, index) => index !== selectedIndex))
    setSelectedBlockId(null)
  }

  const undo = useCallback(() => {
    const hist = historyRef.current
    if (hist.past.length === 0) return
    const previous = hist.past.pop()
    hist.future.push(cloneDocument(documentRef.current))
    skipHistoryRef.current = true
    onDocumentChange(previous)
    skipHistoryRef.current = false
    bumpHistory()
  }, [onDocumentChange, bumpHistory])

  const redo = useCallback(() => {
    const hist = historyRef.current
    if (hist.future.length === 0) return
    const next = hist.future.pop()
    hist.past.push(cloneDocument(documentRef.current))
    skipHistoryRef.current = true
    onDocumentChange(next)
    skipHistoryRef.current = false
    bumpHistory()
  }, [onDocumentChange, bumpHistory])

  useEffect(() => {
    const previous = window.document.body.style.overflow
    window.document.body.style.overflow = 'hidden'
    return () => {
      window.document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }
      if (
        meta &&
        (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))
      ) {
        event.preventDefault()
        redo()
      }
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault()
        onSaveRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const statusLabel = useMemo(() => {
    if (saving) return 'Saving…'
    if (savedFlash) return 'Draft up to date'
    if (previewLoading) return 'Updating preview…'
    return status === 'published' ? 'Published' : 'Draft'
  }, [saving, savedFlash, previewLoading, status])

  const canvasMaxWidth =
    viewport === 'mobile'
      ? 320
      : viewport === 'tablet'
        ? 720
        : Math.min(Number(settings.width) || 600, 800) + 40

  const canUndo = historyTick >= 0 && historyRef.current.past.length > 0
  const canRedo = historyTick >= 0 && historyRef.current.future.length > 0

  const fieldClass =
    'h-9 w-full rounded-lg border border-line bg-midnight px-3 text-[13px] text-ink outline-none transition placeholder:text-muted/60 focus:border-electric'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-midnight text-ink">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-elevated px-3 sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] text-muted transition hover:bg-secondary hover:text-ink"
        >
          <X className="size-3.5" />
          Close
        </button>

        <div className="mx-0.5 hidden h-5 w-px bg-line sm:block" />

        <div className="min-w-0 flex-1">
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="w-full max-w-sm truncate border-0 bg-transparent text-[13px] font-semibold tracking-tight text-ink outline-none placeholder:text-muted"
            placeholder="Untitled email template"
          />
          {nameError ? <p className="text-[11px] text-danger">{nameError}</p> : null}
        </div>

        <p className="hidden text-[11px] text-muted md:block">{statusLabel}</p>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="hidden h-8 rounded-lg border border-line bg-midnight px-2 text-[12px] text-ink sm:block"
          aria-label="Template status"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <div className="hidden items-center rounded-lg border border-line bg-midnight p-0.5 md:flex">
          {[
            { id: 'desktop', icon: Monitor, label: 'Desktop' },
            { id: 'tablet', icon: Tablet, label: 'Tablet' },
            { id: 'mobile', icon: Smartphone, label: 'Mobile' },
          ].map((item) => {
            const Icon = item.icon
            const active = viewport === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-pressed={active}
                onClick={() => setViewport(item.id)}
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

        <div className="flex items-center">
          <button
            type="button"
            aria-label="Undo"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-md p-1.5 text-muted transition hover:bg-secondary hover:text-ink disabled:opacity-30"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-md p-1.5 text-muted transition hover:bg-secondary hover:text-ink disabled:opacity-30"
          >
            <Redo2 className="size-3.5" />
          </button>
        </div>

        <div className="ml-1 flex items-center gap-1.5">
          {!pickingForCampaign && onDelete ? (
            <Button variant="ghost" size="sm" onClick={onDelete} className="hidden text-muted lg:inline-flex">
              Delete
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            disabled={previewLoading}
            onClick={onRefreshPreview}
            className="gap-1.5"
          >
            <Eye className="size-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            size="sm"
            disabled={saving || usingInCampaign}
            onClick={onSave}
            className="gap-1.5"
          >
            <Save className="size-3.5" />
            {saving ? 'Saving…' : 'Save template'}
          </Button>
          {pickingForCampaign ? (
            <Button size="sm" disabled={saving || usingInCampaign} onClick={onUseInCampaign}>
              {usingInCampaign ? 'Applying…' : 'Use in campaign'}
            </Button>
          ) : null}
        </div>
      </header>

      {actionError ? (
        <div
          className="shrink-0 border-b border-danger/25 bg-danger/10 px-4 py-2 text-[13px] text-danger"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {pickingForCampaign ? (
        <div className="shrink-0 border-b border-electric/25 bg-electric/10 px-4 py-2 text-[12px] text-muted">
          <span className="font-medium text-ink">Editing for campaign.</span> Save, then Use in
          campaign to return to the wizard.
        </div>
      ) : null}

      <div className="shrink-0 border-b border-line bg-elevated px-4 py-3">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <label className="block min-w-0 space-y-1.5">
            <div className="flex h-4 items-center justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                Subject
              </span>
              <span className="invisible text-[10px] tabular-nums" aria-hidden>
                0/90
              </span>
            </div>
            <input
              value={subject}
              onChange={(event) => updateSettings({ subject: event.target.value })}
              placeholder="The offer is live at {{shop_name}}"
              className={fieldClass}
            />
          </label>
          <label className="block min-w-0 space-y-1.5">
            <div className="flex h-4 items-center justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                Preheader
              </span>
              <span
                className={cn(
                  'text-[10px] tabular-nums',
                  preheader.length > 90 ? 'text-warning' : 'text-muted',
                )}
              >
                {preheader.length}/90
              </span>
            </div>
            <input
              value={preheader}
              onChange={(event) => updateSettings({ preheader: event.target.value.slice(0, 140) })}
              placeholder="Inbox preview text"
              className={fieldClass}
            />
          </label>
        </div>
        <div className="mx-auto mt-2.5 flex w-full max-w-3xl flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted">
          <label className="inline-flex items-center gap-1.5">
            <span>Category</span>
            <input
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="h-6 w-28 rounded border border-line bg-midnight px-1.5 text-[11px] text-ink outline-none focus:border-electric"
            />
          </label>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span className="hidden sm:inline">Sample · Alex · {shopName}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <StudioLeftPanel
          rail={rail}
          onRailChange={setRail}
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => {
            setSelectedBlockId(id)
            setRail('layers')
          }}
          onAddBlock={addBlock}
          assets={assets}
          assetsLoading={assetsLoading}
          assetsError={assetsError}
          assetUploading={assetUploading}
          selectedAssetId={selectedBlock?.type === 'image' ? selectedBlock.props?.asset_id || null : null}
          onPickAsset={pickAsset}
          onUploadAsset={onUploadAsset}
          onRefreshAssets={onRefreshAssets}
          onReorderBlocks={reorderBlocks}
        />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-secondary/40">
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
            <div className="pointer-events-auto flex items-center gap-0.5 rounded-xl border border-line bg-elevated/95 px-1.5 py-1 shadow-sm backdrop-blur-md">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map((item) => {
                const Icon = item.icon
                const active = viewport === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.label}
                    aria-pressed={active}
                    onClick={() => setViewport(item.id)}
                    className={cn(
                      'rounded-lg p-1.5 transition',
                      active ? 'bg-secondary text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    <Icon className="size-3.5" />
                  </button>
                )
              })}
              <span className="mx-1 h-4 w-px bg-line" />
              <button
                type="button"
                aria-label="Refresh preview"
                disabled={previewLoading}
                onClick={onRefreshPreview}
                className="rounded-lg p-1.5 text-muted transition hover:text-ink disabled:opacity-40"
              >
                <RefreshCw className={cn('size-3.5', previewLoading && 'animate-spin')} />
              </button>
              <button
                type="button"
                aria-label="Toggle HTML source"
                aria-pressed={showCode}
                onClick={() => setShowCode((value) => !value)}
                className={cn(
                  'rounded-lg p-1.5 transition',
                  showCode ? 'bg-electric/20 text-electric' : 'text-muted hover:text-ink',
                )}
              >
                <Code2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto canvas-dots px-4 pb-8 pt-14 scrollbar-thin sm:px-8">
            <div
              className="mx-auto transition-[max-width] duration-300 ease-out"
              style={{ maxWidth: canvasMaxWidth }}
            >
              {showCode ? (
                <pre className="max-h-[min(70dvh,820px)] overflow-auto rounded-2xl border border-line bg-midnight p-4 font-mono text-[11px] leading-relaxed text-muted scrollbar-thin">
                  {previewHtml || '<!-- No HTML yet -->'}
                </pre>
              ) : viewport === 'mobile' ? (
                <div
                  className={cn(
                    'flex justify-center py-2 transition duration-200',
                    selectedBlock ? 'rounded-2xl ring-2 ring-electric/45 ring-offset-2 ring-offset-midnight' : '',
                  )}
                >
                  <EmailHtmlPreview html={previewHtml} viewport="mobile" />
                </div>
              ) : (
                <div
                  className={cn(
                    'overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-200',
                    selectedBlock ? 'ring-2 ring-electric/45 ring-offset-2 ring-offset-midnight' : '',
                  )}
                >
                  {subject || preheader ? (
                    <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left">
                      {subject ? (
                        <p className="truncate text-[13px] font-semibold text-zinc-900">
                          {subject.replaceAll('{{shop_name}}', shopName)}
                        </p>
                      ) : null}
                      {preheader ? (
                        <p className="truncate text-[11px] text-zinc-500">{preheader}</p>
                      ) : null}
                    </div>
                  ) : null}
                  <EmailHtmlPreview
                    html={previewHtml}
                    viewport="desktop"
                    className={cn(
                      'max-w-none',
                      viewport === 'desktop' ? 'min-h-[480px]' : '',
                    )}
                  />
                </div>
              )}
            </div>

            {blocks.length > 0 && !showCode ? (
              <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-1">
                {blocks.map((block, index) => (
                  <button
                    key={block.id || index}
                    type="button"
                    onClick={() => {
                      setSelectedBlockId(block.id)
                      setRail('layers')
                    }}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[10px] font-medium capitalize tracking-wide transition',
                      selectedBlockId === block.id
                        ? 'bg-electric/20 text-ink'
                        : 'bg-elevated text-muted hover:bg-secondary hover:text-ink',
                    )}
                  >
                    {block.type}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </main>

        <StudioInspector
          settings={settings}
          block={selectedBlock}
          blockIndex={Math.max(selectedIndex, 0)}
          blockCount={blocks.length}
          assets={assets}
          assetsLoading={assetsLoading}
          assetsError={assetsError}
          assetUploading={assetUploading}
          onUpdateSettings={updateSettings}
          onUpdateBlockProps={updateBlockProps}
          onMoveBlock={moveSelected}
          onRemoveBlock={removeSelected}
          onClearSelection={() => setSelectedBlockId(null)}
          onUploadAsset={onUploadAsset}
          onRefreshAssets={onRefreshAssets}
        />
      </div>
    </div>
  )
}
