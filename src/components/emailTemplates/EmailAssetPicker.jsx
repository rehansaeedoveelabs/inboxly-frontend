import { useRef, useState } from 'react'
import { Image as ImageIcon, Upload } from 'lucide-react'
import { AssetThumbnail } from '../assets/AssetThumbnail'
import { Button } from '../ui'
import { formatAssetMeta, validateAssetFile } from '../../lib/assetsApi'
import { cn } from '../../lib/cn'

function firstImageFile(fileList) {
  if (!fileList?.length) return null
  for (const file of fileList) {
    if (file.type?.startsWith('image/')) return file
  }
  return fileList[0] || null
}

/**
 * Visual asset picker for email image blocks.
 * Prefer drag-and-drop — macOS file dialogs don't show Inboxly thumbnails.
 */
export function EmailAssetPicker({
  assets = [],
  value = null,
  loading = false,
  error = '',
  uploading = false,
  onSelect,
  onUpload,
  onRefresh,
  emptyHint = 'Drop an image here or upload one to use it in this block.',
  compact = false,
}) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const pickFile = async (file) => {
    if (!file || !onUpload) return
    setLocalError('')
    const fileError = validateAssetFile(file)
    if (fileError) {
      setLocalError(fileError)
      return
    }
    try {
      const created = await onUpload(file)
      if (created?.id) onSelect?.(created.id)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to upload image.')
    }
  }

  const onDropFiles = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(false)
    const file = firstImageFile(event.dataTransfer?.files)
    if (file) pickFile(file)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-ink">
          {value ? 'Selected image' : 'Choose an image'}
        </p>
        <div className="flex items-center gap-1.5">
          {onRefresh ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading || uploading}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          ) : null}
          {onUpload ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) pickFile(file)
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                {uploading ? 'Uploading…' : 'Browse'}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {onUpload ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDragOver(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDragOver(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setDragOver(false)
            }
          }}
          onDrop={onDropFiles}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3 text-center transition',
            compact ? 'py-5' : 'py-7',
            dragOver
              ? 'border-electric bg-electric/15 text-ink'
              : 'border-line bg-midnight/50 text-muted hover:border-electric/40 hover:bg-electric/5',
            uploading ? 'pointer-events-none opacity-60' : null,
          )}
        >
          <Upload className={cn('size-5', dragOver ? 'text-electric' : '')} />
          <div>
            <p className="text-[12px] font-semibold text-ink">
              {uploading ? 'Uploading…' : 'Drop image here'}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              JPEG, PNG, GIF, or WebP · max 5 MB · or click to browse
            </p>
          </div>
        </div>
      ) : null}

      {value ? (
        <div className="overflow-hidden rounded-xl border border-electric/40 bg-electric/5">
          <AssetThumbnail
            assetId={value}
            alt="Selected"
            maxEdge={compact ? 360 : 640}
            className={cn('w-full', compact ? 'h-28' : 'h-36')}
            imgClassName="h-full w-full object-cover"
          />
          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
            <p className="truncate text-[11px] text-muted">
              {assets.find((asset) => asset.id === value)?.name || value}
            </p>
            <button
              type="button"
              className="text-[11px] font-medium text-danger hover:underline"
              onClick={() => onSelect?.(null)}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {loading && assets.length === 0 ? (
        <p className="text-[12px] text-muted">Loading images…</p>
      ) : null}

      {!loading && assets.length === 0 && !onUpload ? (
        <div className="rounded-xl border border-dashed border-line bg-midnight/40 px-3 py-6 text-center">
          <ImageIcon className="mx-auto size-6 text-muted" />
          <p className="mt-2 text-[12px] text-muted">{emptyHint}</p>
        </div>
      ) : null}

      {assets.length > 0 ? (
        <div
          className={cn(
            'grid gap-2',
            compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
          )}
        >
          {assets.map((asset) => {
            const active = asset.id === value
            return (
              <button
                key={asset.id}
                type="button"
                title={asset.name}
                onClick={() => onSelect?.(asset.id)}
                className={cn(
                  'overflow-hidden rounded-xl border text-left transition',
                  active
                    ? 'border-electric ring-2 ring-electric/30'
                    : 'border-line hover:border-electric/40',
                )}
              >
                <AssetThumbnail
                  assetId={asset.id}
                  alt={asset.alt || asset.name || ''}
                  maxEdge={240}
                  className="h-20 w-full"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="space-y-0.5 px-2 py-1.5">
                  <p className="truncate text-[11px] font-medium text-ink">{asset.name}</p>
                  <p className="truncate text-[10px] text-muted">{formatAssetMeta(asset)}</p>
                </div>
              </button>
            )
          })}
        </div>
      ) : null}

      {error || localError ? (
        <p className="text-[12px] text-danger" role="alert">
          {localError || error}
        </p>
      ) : null}
    </div>
  )
}
