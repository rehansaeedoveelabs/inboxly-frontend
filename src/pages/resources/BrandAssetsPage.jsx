import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  FormField,
  Input,
  Select,
  Badge,
  Modal,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { brandFromStore, defaultBrandState, updateStoreBrand } from '../../lib/brandApi'
import { listStoreAssets, uploadStoreAsset, validateAssetFile } from '../../lib/assetsApi'
import { useActiveStore } from '../../store/useActiveStore'

export function BrandAssetsPage() {
  const { activeStore, status: storeStatus, refreshStores } = useActiveStore()
  const storeId = activeStore?.id
  const fileRef = useRef(null)

  const [brand, setBrand] = useState(defaultBrandState)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [savedNotice, setSavedNotice] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)
  const [socialDraft, setSocialDraft] = useState({ network: 'Instagram', url: '' })
  const [library, setLibrary] = useState([])

  const hydrate = useCallback(() => {
    if (!activeStore) {
      setBrand(defaultBrandState())
      setLoading(false)
      return
    }
    setBrand(brandFromStore(activeStore))
    setLoading(false)
    setLoadError('')
  }, [activeStore])

  useEffect(() => {
    if (storeStatus === 'loading') return
    hydrate()
  }, [storeStatus, hydrate])

  useEffect(() => {
    if (!storeId || storeStatus === 'loading') return undefined
    let cancelled = false
    listStoreAssets(storeId, { limit: 25 })
      .then((page) => {
        if (!cancelled) setLibrary(page.data || [])
      })
      .catch(() => {
        if (!cancelled) setLibrary([])
      })
    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus])

  const save = async () => {
    if (!storeId || saving) return
    setSaving(true)
    setActionError('')
    try {
      const next = await updateStoreBrand(storeId, brand)
      setBrand(next)
      await refreshStores?.()
      setSavedNotice(true)
      window.setTimeout(() => setSavedNotice(false), 2500)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to save brand assets.')
    } finally {
      setSaving(false)
    }
  }

  const onUploadLogo = async (file) => {
    if (!storeId || !file || uploading) return
    const fileError = validateAssetFile(file)
    if (fileError) {
      setActionError(fileError)
      return
    }
    setUploading(true)
    setActionError('')
    try {
      const asset = await uploadStoreAsset(storeId, { file, alt: 'Brand logo' })
      setBrand((value) => ({
        ...value,
        logo_asset_id: asset.id,
        logo_name: asset.original_filename || asset.filename || file.name,
      }))
      setLibrary((rows) => [asset, ...rows.filter((row) => row.id !== asset.id)])
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to upload logo.')
    } finally {
      setUploading(false)
    }
  }

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading brand assets…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Brand assets are scoped to the active store."
      />
    )
  }

  if (loadError) {
    return (
      <ErrorState title="Unable to load brand assets" description={loadError} onRetry={hydrate} />
    )
  }

  return (
    <div>
      <PageHeader
        title="Brand assets"
        description={`Logo, colors, typography and social links for ${activeStore?.name || 'your store'}.`}
        actions={
          <>
            <Badge tone="info">Live</Badge>
            <Button disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save brand assets'}
            </Button>
          </>
        }
      />

      {savedNotice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          Brand assets saved to this store.
        </div>
      ) : null}
      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Logo</h3>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) onUploadLogo(file)
              }}
            />
            <button
              type="button"
              className="flex h-28 w-full items-center justify-center rounded-md border border-dashed border-line bg-midnight text-sm text-muted hover:border-electric"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading
                ? 'Uploading…'
                : brand.logo_name
                  ? `Selected: ${brand.logo_name}`
                  : 'Upload logo'}
            </button>
            {library.length > 0 ? (
              <FormField label="Or pick from image library" className="mt-3">
                <Select
                  value={brand.logo_asset_id || ''}
                  onChange={(event) => {
                    const id = event.target.value || null
                    const match = library.find((row) => row.id === id)
                    setBrand((value) => ({
                      ...value,
                      logo_asset_id: id,
                      logo_name: match?.original_filename || match?.filename || value.logo_name,
                    }))
                  }}
                >
                  <option value="">None</option>
                  {library.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.original_filename || asset.filename || asset.id}
                    </option>
                  ))}
                </Select>
              </FormField>
            ) : null}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Colors</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {['accent', 'dark', 'light'].map((key) => (
                <FormField key={key} label={key[0].toUpperCase() + key.slice(1)}>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-8 rounded-md border border-line"
                      style={{ background: brand.colors[key] }}
                      aria-hidden
                    />
                    <Input
                      value={brand.colors[key]}
                      onChange={(event) =>
                        setBrand((value) => ({
                          ...value,
                          colors: { ...value.colors, [key]: event.target.value },
                        }))
                      }
                    />
                  </div>
                </FormField>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Fonts</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Headings">
                <Select
                  value={brand.fonts.headings}
                  onChange={(event) =>
                    setBrand((value) => ({
                      ...value,
                      fonts: { ...value.fonts, headings: event.target.value },
                    }))
                  }
                >
                  <option>DM Sans</option>
                  <option>Inter</option>
                  <option>Georgia</option>
                </Select>
              </FormField>
              <FormField label="Paragraph & footnotes">
                <Select
                  value={brand.fonts.body}
                  onChange={(event) =>
                    setBrand((value) => ({
                      ...value,
                      fonts: { ...value.fonts, body: event.target.value },
                    }))
                  }
                >
                  <option>DM Sans</option>
                  <option>Inter</option>
                  <option>Georgia</option>
                </Select>
              </FormField>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-muted uppercase">
                Social links
              </h3>
              <Button size="sm" variant="secondary" onClick={() => setSocialOpen(true)}>
                <Plus className="size-4" />
                Add social link
              </Button>
            </div>
            <ul className="space-y-2">
              {brand.social_links.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-line bg-midnight px-3 py-2 text-sm"
                >
                  <span className="text-ink">{link.network}</span>
                  <span className="truncate text-muted">{link.url}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setBrand((value) => ({
                        ...value,
                        social_links: value.social_links.filter((row) => row.id !== link.id),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
              {brand.social_links.length === 0 ? (
                <li className="text-sm text-muted">No social links yet.</li>
              ) : null}
            </ul>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Email brand preview</h3>
          <div
            className="overflow-hidden rounded-lg border border-line"
            style={{ background: brand.colors.light, color: brand.colors.dark }}
          >
            <div className="border-b px-5 py-4" style={{ borderColor: `${brand.colors.dark}22` }}>
              <div className="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-semibold tracking-wide uppercase opacity-70">
                {brand.logo_name || 'LOGO'}
              </div>
            </div>
            <div className="px-5 py-4" style={{ background: brand.colors.dark, color: brand.colors.light }}>
              <p className="text-xs opacity-80">Here&apos;s how your dark color will look.</p>
            </div>
            <div className="space-y-3 px-5 py-5">
              <h4 className="text-2xl font-bold" style={{ fontFamily: brand.fonts.headings }}>
                This is your heading
              </h4>
              <p className="text-sm leading-relaxed opacity-80" style={{ fontFamily: brand.fonts.body }}>
                Paragraph and footnote styles use your selected body font. Accent color drives
                primary buttons in campaigns and forms.
              </p>
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                style={{ background: brand.colors.accent }}
              >
                Button
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
        title="Add social link"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSocialOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!socialDraft.url.trim()) return
                setBrand((value) => ({
                  ...value,
                  social_links: [
                    ...value.social_links,
                    {
                      id: `soc_${Date.now()}`,
                      network: socialDraft.network,
                      url: socialDraft.url.trim(),
                    },
                  ],
                }))
                setSocialDraft({ network: 'Instagram', url: '' })
                setSocialOpen(false)
              }}
            >
              Add link
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="Network">
            <Select
              value={socialDraft.network}
              onChange={(event) =>
                setSocialDraft((value) => ({ ...value, network: event.target.value }))
              }
            >
              <option>Instagram</option>
              <option>X</option>
              <option>Facebook</option>
              <option>TikTok</option>
            </Select>
          </FormField>
          <FormField label="URL">
            <Input
              value={socialDraft.url}
              onChange={(event) =>
                setSocialDraft((value) => ({ ...value, url: event.target.value }))
              }
              placeholder="https://"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
