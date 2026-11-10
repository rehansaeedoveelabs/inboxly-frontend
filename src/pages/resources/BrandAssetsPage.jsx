import { useState } from 'react'
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
} from '../../components/ui'
import { getBrandAssets } from '../../mock'

export function BrandAssetsPage() {
  const initial = getBrandAssets()
  const [brand, setBrand] = useState(initial)
  const [socialOpen, setSocialOpen] = useState(false)
  const [socialDraft, setSocialDraft] = useState({ network: 'Instagram', url: '' })
  const [savedNotice, setSavedNotice] = useState(false)

  return (
    <div>
      <PageHeader
        title="Brand assets"
        description="Logo, colors, typography and social links used across email previews. Prototype data only."
        actions={
          <>
            <Badge tone="accent">Prototype</Badge>
            <Button
              onClick={() => {
                setSavedNotice(true)
                window.setTimeout(() => setSavedNotice(false), 2500)
              }}
            >
              Save brand assets
            </Button>
          </>
        }
      />

      {savedNotice ? (
        <div className="mb-3 rounded-md border border-cantaloupe/40 bg-cantaloupe/10 px-3 py-2 text-sm text-cantaloupe">
          Local preview updated — nothing was saved to a backend.
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Logo</h3>
            <button
              type="button"
              className="flex h-28 w-full items-center justify-center rounded-md border border-dashed border-line bg-midnight text-sm text-muted hover:border-electric"
              onClick={() =>
                setBrand((value) => ({
                  ...value,
                  logoPresent: true,
                  logoName: 'uploaded-logo.svg',
                }))
              }
            >
              {brand.logoPresent ? `Selected: ${brand.logoName}` : 'Select file (mock)'}
            </button>
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
              {brand.socialLinks.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center justify-between rounded-md border border-line bg-midnight px-3 py-2 text-sm"
                >
                  <span className="text-ink">{link.network}</span>
                  <span className="truncate text-muted">{link.url}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="secondary"
            onClick={() =>
              setBrand((value) => ({
                ...value,
                colors: { accent: '#2878FF', dark: '#10131C', light: '#FFFFFF' },
                fonts: { headings: 'DM Sans', body: 'DM Sans' },
              }))
            }
          >
            Import my brand assets (mock)
          </Button>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Email brand preview</h3>
          <div
            className="overflow-hidden rounded-lg border border-line"
            style={{ background: brand.colors.light, color: brand.colors.dark }}
          >
            <div className="border-b px-5 py-4" style={{ borderColor: `${brand.colors.dark}22` }}>
              <div className="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-semibold tracking-wide uppercase opacity-70">
                {brand.logoPresent ? brand.logoName : 'LOGO'}
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
                  socialLinks: [
                    ...value.socialLinks,
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
