import { useMemo, useState } from 'react'
import { Image as ImageIcon, Link2, Upload } from 'lucide-react'
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
} from '../../components/ui'
import { getImages } from '../../mock'
import { formatDateTime } from '../../lib/format'

export function ImageLibraryPage() {
  const [images, setImages] = useState(getImages())
  const [query, setQuery] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [urlOpen, setUrlOpen] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showEmpty, setShowEmpty] = useState(false)

  const selected = images.find((image) => image.id === selectedId) || null

  const rows = useMemo(() => {
    if (showEmpty) return []
    return images.filter((image) =>
      `${image.name} ${image.alt}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
  }, [images, query, showEmpty])

  const addMockImage = (name) => {
    setImages((current) => [
      {
        id: `img_${Date.now()}`,
        name,
        alt: name,
        width: 1200,
        height: 800,
        sizeKb: 220,
        uploadedAt: new Date().toISOString(),
        color: '#2878FF',
      },
      ...current,
    ])
    setShowEmpty(false)
  }

  return (
    <div>
      <PageHeader
        title="Image library"
        description="Upload interface is a visual prototype — files are not stored on a server."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowEmpty((value) => !value)}>
              {showEmpty ? 'Show assets' : 'Show empty'}
            </Button>
            <Button variant="secondary" onClick={() => setUrlOpen(true)}>
              <Link2 className="size-4" />
              Upload from URL
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="size-4" />
              Upload from computer
            </Button>
          </>
        }
      />

      <div className="mb-3 max-w-md">
        <SearchInput
          placeholder="Search images"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Your image library is empty"
          description="Drag and drop is simulated below. No real upload occurs in this prototype."
          actionLabel="Upload from computer"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedId(image.id)}
              className="overflow-hidden rounded-lg border border-line bg-elevated text-left hover:border-electric"
            >
              <div
                className="flex h-36 items-center justify-center text-sm font-semibold text-ink"
                style={{ background: `${image.color}33` }}
              >
                {image.name.split('.')[0]}
              </div>
              <div className="space-y-1 p-3">
                <p className="truncate text-sm font-medium text-ink">{image.name}</p>
                <p className="text-xs text-muted">
                  {image.width}×{image.height} · {image.sizeKb} KB
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload from computer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                addMockImage(`upload-${images.length + 1}.jpg`)
                setUploadOpen(false)
              }}
            >
              Add mock file
            </Button>
          </>
        }
      >
        <div className="rounded-md border border-dashed border-line bg-midnight px-4 py-10 text-center">
          <Upload className="mx-auto mb-2 size-6 text-electric" />
          <p className="text-sm text-ink">Drop files here</p>
          <p className="mt-1 text-xs text-muted">Visual prototype only — nothing is uploaded.</p>
        </div>
      </Modal>

      <Modal
        open={urlOpen}
        onClose={() => setUrlOpen(false)}
        title="Upload from URL"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUrlOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                addMockImage(urlValue.trim() || 'from-url.png')
                setUrlValue('')
                setUrlOpen(false)
              }}
            >
              Add mock URL asset
            </Button>
          </>
        }
      >
        <FormField label="Image URL">
          <Input
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
            placeholder="https://cdn.example.com/banner.jpg"
          />
        </FormField>
      </Modal>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Asset preview"
      >
        {selected ? (
          <div className="space-y-3">
            <div
              className="flex h-48 items-center justify-center rounded-md border border-line text-sm font-semibold"
              style={{ background: `${selected.color}33` }}
            >
              Preview
            </div>
            <Card>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Name</dt>
                  <dd>{selected.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Alt</dt>
                  <dd>{selected.alt}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Dimensions</dt>
                  <dd>
                    {selected.width}×{selected.height}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Uploaded</dt>
                  <dd>{formatDateTime(selected.uploadedAt)}</dd>
                </div>
              </dl>
            </Card>
            <Badge tone="accent">Prototype asset</Badge>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
