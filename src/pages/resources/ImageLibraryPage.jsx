import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  Badge,
  EmptyState,
  Modal,
  FormField,
  Input,
  Drawer,
  SearchInput,
  LoadingState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  deleteAsset,
  downloadAsset,
  formatAssetMeta,
  listStoreAssets,
  uploadStoreAsset,
  validateAssetFile,
} from '../../lib/assetsApi'
import { formatDateTime } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 25

export function ImageLibraryPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [assets, setAssets] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [refreshNonce, setRefreshNonce] = useState(0)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [alt, setAlt] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  const previewUrlRef = useRef('')
  const listRequestId = useRef(0)

  const selected = assets.find((asset) => asset.id === selectedId) || null

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const reload = useCallback(() => {
    setRefreshNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    const requestId = ++listRequestId.current
    setListLoading(true)
    setLoadError('')

    listStoreAssets(storeId, { q: debouncedQuery || null, limit: PAGE_LIMIT })
      .then((page) => {
        if (listRequestId.current !== requestId) return
        setAssets(page.data)
        setNextCursor(page.nextCursor)
      })
      .catch((error) => {
        if (listRequestId.current !== requestId) return
        setAssets([])
        setNextCursor(null)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load assets.')
      })
      .finally(() => {
        if (listRequestId.current === requestId) setListLoading(false)
      })

    return undefined
  }, [storeId, storeStatus, debouncedQuery, refreshNonce])

  useEffect(() => {
    if (!selectedId) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = ''
      }
      setPreviewUrl('')
      setPreviewError('')
      return undefined
    }

    let cancelled = false
    setPreviewError('')
    downloadAsset(selectedId)
      .then(({ blob }) => {
        if (cancelled) return
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
        const url = URL.createObjectURL(blob)
        previewUrlRef.current = url
        setPreviewUrl(url)
      })
      .catch((error) => {
        if (cancelled) return
        setPreviewUrl('')
        setPreviewError(error instanceof ApiError ? error.message : 'Unable to preview.')
      })

    return () => {
      cancelled = true
    }
  }, [selectedId])

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
    [],
  )

  const loadMore = async () => {
    if (!storeId || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await listStoreAssets(storeId, {
        q: debouncedQuery || null,
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      })
      setAssets((current) => [...current, ...page.data])
      setNextCursor(page.nextCursor)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to load more assets.')
    } finally {
      setLoadingMore(false)
    }
  }

  const submitUpload = async () => {
    if (!storeId || uploading) return
    const validation = validateAssetFile(file)
    if (validation) {
      setUploadError(validation)
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const asset = await uploadStoreAsset(storeId, { file, alt })
      setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)])
      setUploadOpen(false)
      setFile(null)
      setAlt('')
      setSelectedId(asset.id)
    } catch (error) {
      setUploadError(error instanceof ApiError ? error.message : 'Unable to upload.')
    } finally {
      setUploading(false)
    }
  }

  const removeSelected = async () => {
    if (!selected || deleting) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteAsset(selected.id)
      setAssets((current) => current.filter((item) => item.id !== selected.id))
      setSelectedId(null)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to delete the asset.')
    } finally {
      setDeleting(false)
    }
  }

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Image assets are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Image library"
        description="Upload images for email templates. Files are stored privately per store."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" />
            Upload image
          </Button>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mb-3 max-w-md">
        <SearchInput
          placeholder="Search images"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {listLoading ? (
        <LoadingState label="Loading images…" />
      ) : loadError ? (
        <ErrorState title="Unable to load images" description={loadError} onRetry={reload} />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Your image library is empty"
          description="Upload a JPEG, PNG, GIF, or WebP (max 5 MB)."
          actionLabel="Upload image"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedId(asset.id)}
                className="overflow-hidden rounded-lg border border-line bg-elevated text-left hover:border-electric"
              >
                <div className="flex h-36 items-center justify-center bg-midnight text-sm font-semibold text-muted">
                  {(asset.name || 'image').slice(0, 18)}
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium text-ink">{asset.name}</p>
                  <p className="text-xs text-muted">{formatAssetMeta(asset)}</p>
                </div>
              </button>
            ))}
          </div>
          {nextCursor ? (
            <div className="mt-4">
              <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => {
          if (uploading) return
          setUploadOpen(false)
          setUploadError('')
        }}
        title="Upload image"
        footer={
          <>
            <Button
              variant="ghost"
              disabled={uploading}
              onClick={() => {
                setUploadOpen(false)
                setUploadError('')
              }}
            >
              Cancel
            </Button>
            <Button disabled={uploading || !file} onClick={submitUpload}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="File" error={uploadError}>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null)
                setUploadError('')
              }}
            />
          </FormField>
          <FormField label="Alt text">
            <Input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Describe the image"
            />
          </FormField>
          <p className="text-xs text-muted">JPEG, PNG, GIF, or WebP · max 5 MB</p>
        </div>
      </Modal>

      <Drawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Asset preview">
        {selected ? (
          <div className="space-y-3">
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-md border border-line bg-midnight">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={selected.alt || selected.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="text-sm text-muted">{previewError || 'Loading preview…'}</p>
              )}
            </div>
            <Card>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Name</dt>
                  <dd className="truncate">{selected.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Alt</dt>
                  <dd className="truncate">{selected.alt || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Details</dt>
                  <dd>{formatAssetMeta(selected)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Uploaded</dt>
                  <dd>{formatDateTime(selected.created_at)}</dd>
                </div>
              </dl>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{selected.mime_type}</Badge>
              <Button variant="danger" disabled={deleting} onClick={removeSelected}>
                <Trash2 className="size-4" />
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
