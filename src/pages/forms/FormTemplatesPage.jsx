import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LayoutTemplate,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import {
  Button,
  EmptyState,
  LoadingState,
} from '../../components/ui'
import { FormTemplateCard } from '../../components/forms/FormTemplateCard'
import { ApiError } from '../../lib/api'
import { createStoreForm } from '../../lib/formsApi'
import {
  FORM_TEMPLATE_GOALS,
  FORM_TEMPLATE_TYPES,
  FORM_TEMPLATES,
  apiFormType,
  filterFormTemplates,
  highConvertingFormTemplates,
  recommendedFormTemplates,
} from '../../lib/formTemplateCatalog'
import { cn } from '../../lib/cn'
import { useActiveStore } from '../../store/useActiveStore'

export function FormTemplatesPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [goal, setGoal] = useState(null)
  const [type, setType] = useState(null)
  const [query, setQuery] = useState('')
  const [creatingId, setCreatingId] = useState(null)
  const [actionError, setActionError] = useState('')

  const recommended = useMemo(() => recommendedFormTemplates(), [])
  const highConverting = useMemo(() => highConvertingFormTemplates(), [])
  const filtered = useMemo(
    () => filterFormTemplates({ goal, type, query }),
    [goal, type, query],
  )

  const browsingHome = !goal && !type && !query.trim()
  const activeGoal = FORM_TEMPLATE_GOALS.find((item) => item.id === goal)
  const activeType = FORM_TEMPLATE_TYPES.find((item) => item.id === type)

  const useTemplate = async (template) => {
    if (!storeId || creatingId) return
    setCreatingId(template.id)
    setActionError('')
    try {
      const created = await createStoreForm(storeId, {
        name: template.name,
        type: apiFormType(template.type),
        definition: template.definition,
        status: 'draft',
      })
      navigate(`/forms/${created.id}`)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to create form from template.')
      setCreatingId(null)
    }
  }

  const clearFilters = () => {
    setGoal(null)
    setType(null)
    setQuery('')
  }

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Form templates are scoped to the active store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  return (
    <div className="pb-10">
      <div className="mb-4">
        <Link
          to="/forms"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to forms
        </Link>
      </div>

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_top_left,rgba(40,120,255,0.16),transparent_44%),radial-gradient(ellipse_at_bottom_right,rgba(255,166,107,0.1),transparent_42%),linear-gradient(180deg,#191E2B,#141824)] px-5 py-6 sm:px-7 sm:py-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-electric uppercase">
              <Sparkles className="size-3.5" />
              Form templates
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Choose a form template
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Ready-to-edit popups, embeds, landing pages, and gamified captures for{' '}
              {activeStore?.name || 'your store'}. Pick one and open it in the form builder.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {FORM_TEMPLATES.length} templates
              </span>
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {recommended.length} recommended
              </span>
              <span className="rounded-full bg-secondary/80 px-2.5 py-1">
                {highConverting.length} high converting
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/forms/new')} className="self-start lg:self-auto">
            Start from blank
          </Button>
        </div>
      </section>

      {actionError ? (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <aside className="xl:sticky xl:top-4 xl:w-60 xl:shrink-0">
          <nav
            className="rounded-2xl border border-line bg-elevated p-2"
            aria-label="Form template filters"
          >
            <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Goals
            </p>
            <FilterButton active={goal === null} onClick={() => setGoal(null)}>
              All goals
            </FilterButton>
            {FORM_TEMPLATE_GOALS.map((item) => (
              <FilterButton
                key={item.id}
                active={goal === item.id}
                onClick={() => setGoal(item.id)}
              >
                {item.label}
              </FilterButton>
            ))}

            <div className="my-2 border-t border-line" />

            <p className="px-2.5 pt-1 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
              Format
            </p>
            <FilterButton active={type === null} onClick={() => setType(null)}>
              All formats
            </FilterButton>
            {FORM_TEMPLATE_TYPES.map((item) => (
              <FilterButton
                key={item.id}
                active={type === item.id}
                onClick={() => setType(item.id)}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded bg-cantaloupe/20 px-1.5 py-0.5 text-[10px] font-semibold text-cantaloupe-ink">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
              </FilterButton>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates"
                className="h-10 w-full rounded-xl border border-line bg-elevated pr-3 pl-10 text-sm text-ink outline-none transition placeholder:text-muted focus:border-electric"
              />
            </div>

            {!browsingHome ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeGoal ? <Chip onClear={() => setGoal(null)}>{activeGoal.label}</Chip> : null}
                {activeType ? <Chip onClear={() => setType(null)}>{activeType.label}</Chip> : null}
                {query.trim() ? <Chip onClear={() => setQuery('')}>“{query.trim()}”</Chip> : null}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-muted hover:text-ink"
                >
                  Clear all
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile format chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden scrollbar-thin">
            <FormatChip active={!type} onClick={() => setType(null)}>
              All
            </FormatChip>
            {FORM_TEMPLATE_TYPES.map((item) => (
              <FormatChip key={item.id} active={type === item.id} onClick={() => setType(item.id)}>
                {item.label}
              </FormatChip>
            ))}
          </div>

          {browsingHome ? (
            <>
              <TemplateSection
                title="Recommended"
                subtitle="Strong starters for email & SMS capture."
              >
                {recommended.map((template) => (
                  <FormTemplateCard
                    key={template.id}
                    template={template}
                    busy={creatingId === template.id}
                    onUse={useTemplate}
                  />
                ))}
              </TemplateSection>

              <TemplateSection
                title="High converting"
                subtitle="Quiz, mystery box, scratch card, and wheel templates."
              >
                {highConverting.map((template) => (
                  <FormTemplateCard
                    key={`hc-${template.id}`}
                    template={template}
                    busy={creatingId === template.id}
                    onUse={useTemplate}
                  />
                ))}
              </TemplateSection>
            </>
          ) : null}

          <TemplateSection
            title={browsingHome ? 'All templates' : 'Matching templates'}
            subtitle={`${filtered.length} template${filtered.length === 1 ? '' : 's'}`}
          >
            {filtered.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={LayoutTemplate}
                  title="No templates match"
                  description="Try another goal, format, or search term."
                  actionLabel="Clear filters"
                  onAction={clearFilters}
                />
              </div>
            ) : (
              filtered.map((template) => (
                <FormTemplateCard
                  key={`all-${template.id}`}
                  template={template}
                  busy={creatingId === template.id}
                  onUse={useTemplate}
                />
              ))
            )}
          </TemplateSection>
        </div>
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl px-2.5 py-2 text-left text-sm transition',
        active
          ? 'bg-secondary font-medium text-ink'
          : 'text-muted hover:bg-secondary/50 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function FormatChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-electric/40 bg-electric/15 text-electric'
          : 'border-line bg-elevated text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function Chip({ children, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-elevated px-2.5 py-1 text-xs text-ink">
      {children}
      <button type="button" onClick={onClear} className="text-muted hover:text-ink" aria-label="Remove filter">
        <X className="size-3" />
      </button>
    </span>
  )
}

function TemplateSection({ title, subtitle, children }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{children}</div>
    </section>
  )
}
