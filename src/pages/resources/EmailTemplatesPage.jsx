import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Sparkles } from 'lucide-react'
import {
  Button,
  Badge,
  EmptyState,
  LoadingState,
  ErrorState,
  SearchInput,
} from '../../components/ui'
import { BuiltinTemplateCard, ScratchTemplateCard } from '../../components/emailTemplates/BuiltinTemplateCard'
import { BuiltinTemplatePreviewModal } from '../../components/emailTemplates/BuiltinTemplatePreviewModal'
import { ApiError } from '../../lib/api'
import { applyCampaignTemplate } from '../../lib/campaignsApi'
import {
  clearCampaignTemplatePick,
  finishCampaignTemplatePick,
  getCampaignTemplatePick,
} from '../../lib/campaignTemplatePick'
import { cn } from '../../lib/cn'
import {
  BUILTIN_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_CATEGORIES,
  EMAIL_TEMPLATE_STYLES,
  emailTemplateCategoryLabel,
  filterBuiltinEmailTemplates,
} from '../../lib/emailTemplateCatalog'
import {
  createStoreEmailTemplate,
  duplicateEmailTemplate,
  emptyEmailDocument,
  listStoreEmailTemplates,
} from '../../lib/emailTemplatesApi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 50

export function EmailTemplatesPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const shopName = activeStore?.name || activeStore?.shopify_shop_domain || 'Your shop'

  const [style, setStyle] = useState('premium')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [templates, setTemplates] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [creating, setCreating] = useState(false)
  const [picking, setPicking] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const listRequestId = useRef(0)

  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [pickContext, setPickContext] = useState(() => getCampaignTemplatePick())
  const pickingForCampaign =
    Boolean(pickContext?.campaignId) && (pickContext?.channel || 'email') !== 'sms'

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const reload = useCallback(() => setRefreshNonce((n) => n + 1), [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    const requestId = ++listRequestId.current
    setListLoading(true)
    setLoadError('')

    listStoreEmailTemplates(storeId, {
      q: debouncedQuery || null,
      limit: PAGE_LIMIT,
    })
      .then((page) => {
        if (listRequestId.current !== requestId) return
        setTemplates(page.data)
      })
      .catch((error) => {
        if (listRequestId.current !== requestId) return
        setTemplates([])
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load templates.')
      })
      .finally(() => {
        if (listRequestId.current === requestId) setListLoading(false)
      })

    return undefined
  }, [storeId, storeStatus, debouncedQuery, refreshNonce])

  const builtins = useMemo(
    () =>
      filterBuiltinEmailTemplates({
        style,
        category,
        q: debouncedQuery,
      }),
    [style, category, debouncedQuery],
  )

  const yourFiltered = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return templates.filter((row) => {
      if (!q) return true
      return `${row.name} ${row.category || ''}`.toLowerCase().includes(q)
    })
  }, [templates, debouncedQuery])

  const applyTemplateToCampaign = async (templateId) => {
    setPicking(true)
    setActionError('')
    try {
      const returned = await finishCampaignTemplatePick({
        templateId,
        navigate,
        applyFn: applyCampaignTemplate,
      })
      if (!returned) {
        navigate(`/resources/templates/${templateId}`)
      } else {
        setPickContext(null)
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to apply this template to the campaign.',
      )
    } finally {
      setPicking(false)
    }
  }

  const createFromDocument = async ({ name, category: cat, document, applyToCampaign = false }) => {
    if (!storeId || creating) return null
    setCreating(true)
    setActionError('')
    try {
      const template = await createStoreEmailTemplate(storeId, {
        name,
        category: cat || 'general',
        status: pickingForCampaign ? 'published' : 'draft',
        document,
      })
      if (applyToCampaign && pickingForCampaign) {
        await applyTemplateToCampaign(template.id)
        return template
      }
      // Keep pick context so editor can "Use in campaign" after edits.
      navigate(`/resources/templates/${template.id}`)
      return template
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to create template.')
      return null
    } finally {
      setCreating(false)
    }
  }

  const createScratch = () =>
    createFromDocument({
      name: 'Untitled template',
      category: 'general',
      document: emptyEmailDocument(),
    })

  const useBuiltin = async (builtin) => {
    setPreviewTemplate(null)
    // Always create a store copy and open the editor so the merchant can tweak
    // before "Use in campaign" returns them to the wizard.
    await createFromDocument({
      name: builtin.name,
      category: builtin.category,
      document: structuredClone(builtin.document),
      applyToCampaign: false,
    })
  }

  const cancelCampaignPick = () => {
    const returnTo = pickContext?.returnTo
    clearCampaignTemplatePick()
    setPickContext(null)
    if (returnTo) navigate(returnTo)
  }

  const duplicate = async (templateId) => {
    setActionError('')
    try {
      const copy = await duplicateEmailTemplate(templateId)
      setTemplates((current) => [copy, ...current])
      navigate(`/resources/templates/${copy.id}`)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to duplicate.')
    }
  }

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Email templates are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  const showYours = category === 'yours'
  const showScratch = category !== 'yours'
  const activeStyle = EMAIL_TEMPLATE_STYLES.find((item) => item.id === style)
  const visibleCount = showYours ? yourFiltered.length : builtins.length + (showScratch ? 1 : 0)

  return (
    <div className="pb-8">
      {pickingForCampaign ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-electric/40 bg-electric/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Choosing a template for your campaign</p>
            <p className="mt-0.5 text-sm text-muted">
              {pickContext.campaignName
                ? `Campaign: ${pickContext.campaignName}. `
                : ''}
              Choose a design (or edit one first). You will return to the campaign Template step.
            </p>
          </div>
          <Button variant="secondary" onClick={cancelCampaignPick}>
            Back to campaign
          </Button>
        </div>
      ) : null}

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_top_left,rgba(40,120,255,0.18),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(255,166,107,0.12),transparent_40%),linear-gradient(180deg,#191E2B,#141824)] px-5 py-6 sm:px-7 sm:py-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-electric uppercase">
              <Sparkles className="size-3.5" />
              {pickingForCampaign ? 'Pick for campaign' : 'Template studio'}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Email templates
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              {pickingForCampaign
                ? 'Select a built-in or saved template. After you choose (or finish editing), you return to campaign creation.'
                : `Premium, ready-to-send designs for ${shopName}. Preview on desktop or iPhone 16 Pro Max, then customize — so you never start from a blank page.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {BUILTIN_EMAIL_TEMPLATES.length} built-in designs
              </span>
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {templates.length} saved for your store
              </span>
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">Live merchant preview</span>
            </div>
          </div>
          <Button disabled={creating} onClick={createScratch} className="self-start lg:self-auto">
            {creating ? 'Creating…' : 'Start from scratch'}
          </Button>
        </div>
      </section>

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-elevated p-1.5">
          {EMAIL_TEMPLATE_STYLES.map((item) => {
            const active = style === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStyle(item.id)}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-left transition',
                  active
                    ? 'bg-electric text-white shadow-sm'
                    : 'text-muted hover:bg-secondary hover:text-ink',
                )}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={cn('block text-[11px]', active ? 'text-white/80' : 'text-muted')}>
                  {item.blurb}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-sm text-muted">
          Showing <span className="font-medium text-ink">{visibleCount}</span>
          {activeStyle ? ` · ${activeStyle.label}` : ''}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pb-4 lg:scrollbar-thin">
          <SearchInput
            placeholder="Search templates"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="rounded-2xl border border-line bg-elevated p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Categories
            </p>
            <ul className="space-y-1">
              {EMAIL_TEMPLATE_CATEGORIES.map((item) => {
                const active = category === item.id
                const count =
                  item.id === 'yours'
                    ? templates.length
                    : item.id === 'all'
                      ? filterBuiltinEmailTemplates({ style, category: 'all' }).length
                      : filterBuiltinEmailTemplates({ style, category: item.id }).length
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition',
                        active
                          ? 'bg-electric/15 font-medium text-ink ring-1 ring-electric/30'
                          : 'text-muted hover:bg-secondary hover:text-ink',
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs tabular-nums opacity-70">{count}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        <div className="min-w-0">
          {listLoading && showYours ? (
            <LoadingState label="Loading your templates…" />
          ) : loadError && showYours ? (
            <ErrorState title="Unable to load templates" description={loadError} onRetry={reload} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {showScratch ? (
                <ScratchTemplateCard disabled={creating} onSelect={createScratch} />
              ) : null}

              {showYours
                ? yourFiltered.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-sm"
                    >
                      <Link
                        to={`/resources/templates/${row.id}`}
                        className="flex min-h-[200px] flex-1 flex-col justify-between bg-[linear-gradient(160deg,rgba(40,120,255,0.08),transparent_50%)] p-5 hover:bg-midnight/30"
                      >
                        <div>
                          <p className="text-base font-semibold tracking-tight text-ink">{row.name}</p>
                          <p className="mt-1 text-xs text-muted">
                            {emailTemplateCategoryLabel(row.category) || row.category || 'general'}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
                          <span className="text-[11px] text-muted">{formatDateTime(row.updated_at)}</span>
                        </div>
                      </Link>
                      <div className="flex gap-2 border-t border-line px-3 py-2">
                        {pickingForCampaign ? (
                          <Button
                            className="w-full"
                            disabled={picking || creating}
                            onClick={() => applyTemplateToCampaign(row.id)}
                          >
                            {picking ? 'Applying…' : 'Use in campaign'}
                          </Button>
                        ) : (
                          <Button variant="ghost" className="w-full" onClick={() => duplicate(row.id)}>
                            Duplicate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                : builtins.map((item) => (
                    <BuiltinTemplateCard
                      key={item.id}
                      template={item}
                      shopName={shopName}
                      onPreview={(tpl) => setPreviewTemplate(tpl)}
                      onUse={useBuiltin}
                    />
                  ))}
            </div>
          )}

          {showYours && !listLoading && !loadError && yourFiltered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No saved templates yet"
              description="Pick a premium built-in design or start from scratch — it will show up here."
              actionLabel="Browse premium templates"
              onAction={() => {
                setStyle('premium')
                setCategory('all')
              }}
            />
          ) : null}

          {!showYours && builtins.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No templates in this filter"
              description="Try another category, style, or search term."
              actionLabel="Clear filters"
              onAction={() => {
                setCategory('all')
                setQuery('')
              }}
            />
          ) : null}
        </div>
      </div>

      <BuiltinTemplatePreviewModal
        open={Boolean(previewTemplate)}
        template={previewTemplate}
        storeId={storeId}
        shopName={shopName}
        using={creating || picking}
        chooseLabel={pickingForCampaign ? 'Use in campaign' : 'Choose template'}
        onClose={() => setPreviewTemplate(null)}
        onUse={useBuiltin}
      />
    </div>
  )
}
