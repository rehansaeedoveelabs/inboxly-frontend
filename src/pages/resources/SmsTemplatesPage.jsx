import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquareText, Smartphone } from 'lucide-react'
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchInput,
  Tabs,
} from '../../components/ui'
import {
  NewSmsTemplateCard,
  SmsTemplateCard,
} from '../../components/smsTemplates/SmsTemplateCard'
import { SmsTemplatePreviewModal } from '../../components/smsTemplates/SmsTemplatePreviewModal'
import { ApiError } from '../../lib/api'
import { updateCampaign } from '../../lib/campaignsApi'
import {
  clearCampaignTemplatePick,
  finishCampaignSmsTemplatePick,
  getCampaignTemplatePick,
} from '../../lib/campaignTemplatePick'
import { cn } from '../../lib/cn'
import {
  BUILTIN_SMS_TEMPLATES,
  SMS_TEMPLATE_CATEGORIES,
  filterBuiltinSmsTemplates,
  personalizeSmsBody,
} from '../../lib/smsTemplateCatalog'
import {
  createStoreSmsTemplate,
  listStoreSmsTemplates,
} from '../../lib/smsTemplatesApi'
import { statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 50
const BLANK_BODY =
  'Hi {{first_name}}, thanks for shopping at {{shop_name}}. See what is new: {{short_url}}'

function isBuiltinTemplate(template) {
  return Boolean(template?.id && String(template.id).startsWith('sms-'))
}

export function SmsTemplatesPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const shopName = activeStore?.name || activeStore?.shopify_shop_domain || 'Your shop'

  const [tab, setTab] = useState('library')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [templates, setTemplates] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const listRequestId = useRef(0)

  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [pickContext, setPickContext] = useState(() => getCampaignTemplatePick())
  const pickingForCampaign =
    Boolean(pickContext?.campaignId) && (pickContext?.channel || 'email') === 'sms'

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

    listStoreSmsTemplates(storeId, {
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
      filterBuiltinSmsTemplates({
        category,
        query: debouncedQuery,
      }),
    [category, debouncedQuery],
  )

  const savedFiltered = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return templates.filter((row) => {
      if (category !== 'all' && row.category !== category) return false
      if (!q) return true
      return `${row.name} ${row.body || ''} ${row.category || ''}`.toLowerCase().includes(q)
    })
  }, [templates, debouncedQuery, category])

  const applyBodyToCampaign = async (rawBody) => {
    setBusy(true)
    setActionError('')
    try {
      const body = personalizeSmsBody(rawBody, { shopName })
      const returned = await finishCampaignSmsTemplatePick({
        body,
        navigate,
        updateFn: updateCampaign,
      })
      if (!returned) {
        setActionError('Campaign pick context expired. Open templates again from the campaign.')
      } else {
        setPickContext(null)
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to apply this template to the campaign.',
      )
    } finally {
      setBusy(false)
    }
  }

  const createTemplate = async ({ name, category: cat, body }) => {
    if (!storeId || busy) return null
    setBusy(true)
    setActionError('')
    try {
      const template = await createStoreSmsTemplate(storeId, {
        name,
        category: cat || 'promo',
        status: pickingForCampaign ? 'published' : 'draft',
        body,
      })
      navigate(`/resources/sms-templates/${template.id}`)
      return template
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to create template.')
      return null
    } finally {
      setBusy(false)
    }
  }

  const createScratch = () =>
    createTemplate({
      name: 'Untitled SMS',
      category: 'promo',
      body: BLANK_BODY,
    })

  const useBuiltin = async (builtin) => {
    setPreviewTemplate(null)
    if (pickingForCampaign) {
      await applyBodyToCampaign(builtin.body)
      return
    }
    await createTemplate({
      name: builtin.name,
      category: builtin.category,
      body: builtin.body,
    })
  }

  const useSaved = async (row) => {
    setPreviewTemplate(null)
    if (pickingForCampaign) {
      await applyBodyToCampaign(row.body)
      return
    }
    navigate(`/resources/sms-templates/${row.id}`)
  }

  const cancelCampaignPick = () => {
    const returnTo = pickContext?.returnTo
    clearCampaignTemplatePick()
    setPickContext(null)
    if (returnTo) navigate(returnTo)
  }

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="SMS templates are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  const showingSaved = tab === 'saved'
  const visibleRows = showingSaved ? savedFiltered : builtins

  return (
    <div className="pb-8">
      {pickingForCampaign ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-electric/40 bg-electric/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Choosing an SMS template for your campaign</p>
            <p className="mt-0.5 text-sm text-muted">
              {pickContext.campaignName ? `Campaign: ${pickContext.campaignName}. ` : ''}
              Pick a message and you will return to the campaign Template step.
            </p>
          </div>
          <Button variant="secondary" onClick={cancelCampaignPick}>
            Back to campaign
          </Button>
        </div>
      ) : null}

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_top_left,rgba(40,120,255,0.16),transparent_44%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.1),transparent_42%),linear-gradient(180deg,#191E2B,#141824)] px-5 py-6 sm:px-7 sm:py-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-electric uppercase">
              <Smartphone className="size-3.5" />
              {pickingForCampaign ? 'Pick for campaign' : 'SMS library'}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              SMS templates
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Choose a ready-made SMS template or write your own reusable message.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {BUILTIN_SMS_TEMPLATES.length} built-in
              </span>
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {templates.length} saved
              </span>
            </div>
          </div>
          <Button disabled={busy} onClick={createScratch} className="self-start lg:self-auto">
            {busy ? 'Working…' : 'New template'}
          </Button>
        </div>
      </section>

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'library', label: 'Templates' },
            { value: 'saved', label: `Saved templates (${templates.length})` },
          ]}
        />
        <p className="text-sm text-muted">
          Showing <span className="font-medium text-ink">{visibleRows.length}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
          <SearchInput
            placeholder="Search templates"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="rounded-2xl border border-line bg-elevated p-3">
            <p className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Category
            </p>
            <ul className="space-y-1">
              {SMS_TEMPLATE_CATEGORIES.map((item) => {
                const active = category === item.id
                const count =
                  item.id === 'all'
                    ? showingSaved
                      ? templates.length
                      : BUILTIN_SMS_TEMPLATES.length
                    : showingSaved
                      ? templates.filter((row) => row.category === item.id).length
                      : filterBuiltinSmsTemplates({ category: item.id }).length
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
                      <span className="capitalize">{item.label}</span>
                      <span className="text-xs tabular-nums opacity-70">{count}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        <div className="min-w-0">
          {showingSaved && listLoading ? (
            <LoadingState label="Loading your templates…" />
          ) : showingSaved && loadError ? (
            <ErrorState title="Unable to load templates" description={loadError} onRetry={reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {!showingSaved ? (
                <NewSmsTemplateCard disabled={busy} onSelect={createScratch} />
              ) : null}

              {showingSaved
                ? savedFiltered.map((row) => (
                    <SmsTemplateCard
                      key={row.id}
                      name={row.name}
                      category={row.category}
                      body={row.body}
                      shopName={shopName}
                      statusLabel={statusLabel(row.status)}
                      statusTone={statusTone(row.status)}
                      disabled={busy}
                      useLabel={pickingForCampaign ? 'Use in campaign' : 'Edit'}
                      onPreview={() => setPreviewTemplate(row)}
                      onUse={() => useSaved(row)}
                    />
                  ))
                : builtins.map((item) => (
                    <SmsTemplateCard
                      key={item.id}
                      name={item.name}
                      category={item.category}
                      body={item.body}
                      shopName={shopName}
                      disabled={busy}
                      useLabel={pickingForCampaign ? 'Use in campaign' : 'Use this'}
                      onPreview={() => setPreviewTemplate(item)}
                      onUse={() => useBuiltin(item)}
                    />
                  ))}
            </div>
          )}

          {showingSaved && !listLoading && !loadError && savedFiltered.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title="No saved templates yet"
              description="Pick a ready-made SMS or create a new one — it will show up here."
              actionLabel="Browse templates"
              onAction={() => {
                setTab('library')
                setCategory('all')
              }}
            />
          ) : null}

          {!showingSaved && builtins.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title="No templates in this filter"
              description="Try another category or search term."
              actionLabel="Clear filters"
              onAction={() => {
                setCategory('all')
                setQuery('')
              }}
            />
          ) : null}
        </div>
      </div>

      <SmsTemplatePreviewModal
        open={Boolean(previewTemplate)}
        template={previewTemplate}
        shopName={shopName}
        using={busy}
        useLabel={pickingForCampaign ? 'Use in campaign' : 'Use this'}
        onClose={() => setPreviewTemplate(null)}
        onUse={(tpl) => {
          if (isBuiltinTemplate(tpl)) useBuiltin(tpl)
          else useSaved(tpl)
        }}
      />
    </div>
  )
}
