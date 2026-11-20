import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, Trash2 } from 'lucide-react'
import {
  PageHeader,
  Button,
  Card,
  FormField,
  Input,
  Select,
  Modal,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui'
import { AssetThumbnail } from '../../components/assets/AssetThumbnail'
import { ApiError } from '../../lib/api'
import {
  brandFromStore,
  BRAND_FONT_OPTIONS,
  defaultBrandState,
  importStoreBrand,
  updateStoreBrand,
} from '../../lib/brandApi'
import { listStoreAssets, uploadStoreAsset, validateAssetFile } from '../../lib/assetsApi'
import { startShopifyOAuth } from '../../lib/shopifyOAuth'
import { useActiveStore } from '../../store/useActiveStore'

function ColorSwatch({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-midnight p-2">
        <label className="relative size-10 shrink-0 overflow-hidden rounded-md border border-line">
          <input
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000'}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label} color picker`}
          />
          <span className="block size-full" style={{ background: value }} />
        </label>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono text-[13px]"
        />
      </div>
    </div>
  )
}

export function BrandAssetsPage() {
  const { activeStore, status: storeStatus, refreshStores } = useActiveStore()
  const storeId = activeStore?.id
  const fileRef = useRef(null)

  const [brand, setBrand] = useState(defaultBrandState)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [needsThemesScope, setNeedsThemesScope] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
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

  const flashNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 4000)
  }

  const save = async () => {
    if (!storeId || saving) return
    setSaving(true)
    setActionError('')
    try {
      const next = await updateStoreBrand(storeId, brand)
      setBrand(next)
      await refreshStores?.()
      flashNotice('Brand assets saved.')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to save brand assets.')
    } finally {
      setSaving(false)
    }
  }

  const onImport = async () => {
    if (!storeId || importing) return
    setImporting(true)
    setActionError('')
    setNeedsThemesScope(false)
    try {
      const result = await importStoreBrand(storeId)
      setBrand(result.brand)
      await refreshStores?.()
      if (result.source === 'defaults') {
        setActionError(result.notice)
        setNotice('')
      } else if (result.source === 'missing_themes_scope') {
        setNeedsThemesScope(true)
        setActionError('')
        flashNotice(result.notice)
      } else {
        setActionError('')
        flashNotice(result.notice)
      }
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to import brand assets.')
    } finally {
      setImporting(false)
    }
  }

  const onReconnectShopify = async () => {
    if (!storeId || reconnecting) return
    setReconnecting(true)
    setActionError('')
    try {
      await startShopifyOAuth({ storeId })
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to start Shopify reconnect. Open Storefront settings and reconnect there.',
      )
      setReconnecting(false)
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
        imported_logo_url: null,
      }))
      setLibrary((rows) => [asset, ...rows.filter((row) => row.id !== asset.id)])
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to upload logo.')
    } finally {
      setUploading(false)
    }
  }

  const addAdditionalColor = () => {
    setBrand((value) => {
      if ((value.colors.additional || []).length >= 6) return value
      return {
        ...value,
        colors: {
          ...value.colors,
          additional: [...(value.colors.additional || []), '#CCCCCC'],
        },
      }
    })
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

  const additional = brand.colors.additional || []

  return (
    <div>
      <PageHeader
        title="Brand assets"
        description={`Logo, colors, fonts, and social links for ${activeStore?.name || 'your store'} — saved on the store and used in emails and forms.`}
        actions={
          <Button disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save brand assets'}
          </Button>
        }
      />

      {notice ? (
        <div className="mb-3 rounded-md border border-electric/30 bg-electric/10 px-3 py-2 text-sm text-electric">
          {notice}
        </div>
      ) : null}
      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              Import brand assets right from your store
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={importing} onClick={onImport}>
                <Download className="size-4" />
                {importing ? 'Importing…' : 'Import my Brand Assets'}
              </Button>
              {needsThemesScope ? (
                <Button disabled={reconnecting || !activeStore?.is_connected} onClick={onReconnectShopify}>
                  {reconnecting ? 'Redirecting…' : 'Reconnect Shopify'}
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted">
              Imports store name, then live theme colors when{' '}
              <span className="font-mono text-ink">read_themes</span> is granted. Do{' '}
              <strong className="font-medium text-ink">not</strong> use Checkout Branding scopes. Upload
              a logo here for emails.{' '}
              <Link to="/settings/storefront" className="text-electric hover:underline">
                Storefront settings
              </Link>
            </p>
          </Card>

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
                className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-midnight px-4 py-4 text-sm text-muted transition hover:border-electric"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {brand.logo_asset_id ? (
                  <AssetThumbnail
                    assetId={brand.logo_asset_id}
                    alt={brand.logo_name || 'Logo'}
                    className="size-16 overflow-hidden rounded-md border border-line bg-white"
                    imgClassName="size-full object-contain"
                    maxEdge={160}
                  />
                ) : brand.imported_logo_url ? (
                  <img
                    src={brand.imported_logo_url}
                    alt={brand.logo_name || 'Imported logo'}
                    className="size-16 rounded-md border border-line bg-white object-contain"
                  />
                ) : (
                  <span className="text-xs tracking-wide uppercase opacity-70">Upload logo</span>
                )}
                <span>
                  {uploading
                    ? 'Uploading…'
                    : brand.logo_name
                      ? brand.logo_name
                      : 'Click to upload a logo'}
                </span>
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
                        imported_logo_url: id ? null : value.imported_logo_url,
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
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
                Colors
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <ColorSwatch
                  label="Accent"
                  value={brand.colors.accent}
                  onChange={(accent) =>
                    setBrand((value) => ({ ...value, colors: { ...value.colors, accent } }))
                  }
                />
                <ColorSwatch
                  label="Dark"
                  value={brand.colors.dark}
                  onChange={(dark) =>
                    setBrand((value) => ({ ...value, colors: { ...value.colors, dark } }))
                  }
                />
                <ColorSwatch
                  label="Light"
                  value={brand.colors.light}
                  onChange={(light) =>
                    setBrand((value) => ({ ...value, colors: { ...value.colors, light } }))
                  }
                />
              </div>
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">
                  Additional colors
                </p>
                <div className="flex flex-wrap gap-2">
                  {additional.map((hex, index) => (
                    <div
                      key={`extra-${index}`}
                      className="flex items-center gap-1 rounded-lg border border-line bg-midnight p-1.5"
                    >
                      <input
                        type="color"
                        value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#CCCCCC'}
                        onChange={(event) => {
                          const next = event.target.value.toUpperCase()
                          setBrand((value) => {
                            const list = [...(value.colors.additional || [])]
                            list[index] = next
                            return { ...value, colors: { ...value.colors, additional: list } }
                          })
                        }}
                        className="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                        aria-label={`Additional color ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="rounded p-1 text-muted hover:text-danger"
                        aria-label="Remove color"
                        onClick={() =>
                          setBrand((value) => ({
                            ...value,
                            colors: {
                              ...value.colors,
                              additional: (value.colors.additional || []).filter(
                                (_, i) => i !== index,
                              ),
                            },
                          }))
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {additional.length < 6 ? (
                    <button
                      type="button"
                      onClick={addAdditionalColor}
                      className="flex size-11 items-center justify-center rounded-lg border border-dashed border-line text-muted transition hover:border-electric hover:text-ink"
                      aria-label="Add color"
                    >
                      <Plus className="size-4" />
                    </button>
                  ) : null}
                </div>
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
                    {BRAND_FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
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
                    {BRAND_FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
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
                    <span className="font-medium text-ink">{link.network}</span>
                    <span className="min-w-0 truncate text-muted">{link.url}</span>
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
        </div>

        <Card className="h-fit lg:sticky lg:top-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">Real-time preview</h3>
          <div
            className="overflow-hidden rounded-xl border border-line shadow-sm"
            style={{ background: brand.colors.light, color: brand.colors.dark }}
          >
            <div className="flex items-center justify-center border-b border-black/5 px-5 py-5">
              {brand.logo_asset_id ? (
                <AssetThumbnail
                  assetId={brand.logo_asset_id}
                  alt={brand.logo_name || 'Logo'}
                  className="h-14 w-28 overflow-hidden"
                  imgClassName="mx-auto max-h-14 max-w-full object-contain"
                  maxEdge={240}
                />
              ) : brand.imported_logo_url ? (
                <img
                  src={brand.imported_logo_url}
                  alt=""
                  className="mx-auto max-h-14 max-w-[7rem] object-contain"
                />
              ) : (
                <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-50">
                  Logo
                </span>
              )}
            </div>
            <div
              className="px-5 py-4 text-sm"
              style={{ background: brand.colors.dark, color: brand.colors.light }}
            >
              Here&apos;s how your dark color will look like.
            </div>
            <div className="space-y-3 px-5 py-5">
              <h4
                className="text-[28px] leading-tight font-bold"
                style={{ fontFamily: brand.fonts.headings }}
              >
                This is your heading
              </h4>
              <p
                className="text-[15px] leading-relaxed opacity-80"
                style={{ fontFamily: brand.fonts.body }}
              >
                This is your paragraph and footnotes font. Accent color drives buttons in campaigns
                and forms.
              </p>
              <button
                type="button"
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: brand.colors.accent }}
              >
                Button
              </button>
              {additional.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {additional.map((hex) => (
                    <span
                      key={hex}
                      className="size-5 rounded-full border border-black/10"
                      style={{ background: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              ) : null}
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
              <option>YouTube</option>
              <option>LinkedIn</option>
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
