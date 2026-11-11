import { useMemo, useState } from 'react'
import { Button, Card, ConfirmDialog, SearchInput, Tabs } from '../ui'
import {
  STARTER_CATEGORIES,
  filterStarterMessages,
  hasWritableCampaignContent,
  scratchFormFields,
  starterCategoryLabel,
  starterToFormFields,
} from '../../lib/starterMessages'

/**
 * Content-step starter picker. Applies presets only after an explicit action.
 *
 * @param {{
 *   channel: 'email' | 'sms',
 *   form: { name?: string, subject?: string, previewText?: string, body?: string },
 *   onApplyFields: (fields: { name: string, subject: string, previewText: string, body: string }) => void,
 * }} props
 */
export function StarterMessagePicker({ channel, form, onApplyFields }) {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  const rows = useMemo(
    () => filterStarterMessages({ channel, category, query }),
    [channel, category, query],
  )

  const selected = rows.find((item) => item.id === selectedId) || null

  const categoryTabs = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...STARTER_CATEGORIES.map((item) => ({ value: item.id, label: item.label })),
    ],
    [],
  )

  const requestApply = (action) => {
    if (hasWritableCampaignContent(form, channel)) {
      setPendingAction(action)
      return
    }
    runApply(action)
  }

  const runApply = (action) => {
    if (action?.type === 'scratch') {
      onApplyFields(scratchFormFields(channel))
      setSelectedId(null)
      return
    }
    if (action?.type === 'starter' && action.starter) {
      onApplyFields(starterToFormFields(action.starter))
    }
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Starter messages</h3>
          <p className="mt-1 text-sm text-muted">
            Optional {channel === 'sms' ? 'SMS' : 'email'} presets. Everything stays editable after
            you apply one.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => requestApply({ type: 'scratch' })}>
          Start from scratch
        </Button>
      </div>

      <Tabs value={category} onChange={setCategory} items={categoryTabs} />

      <SearchInput
        className="w-full"
        placeholder="Search starters"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {rows.length === 0 ? (
            <p className="text-sm text-muted">No starters match these filters.</p>
          ) : (
            rows.map((item) => {
              const active = item.id === selectedId
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    active
                      ? 'border-electric bg-electric/10'
                      : 'border-line bg-midnight hover:border-electric/60'
                  }`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">{item.label}</p>
                    <span className="shrink-0 text-xs text-muted">
                      {starterCategoryLabel(item.category)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {channel === 'email' ? item.subject : item.body}
                  </p>
                </button>
              )
            })
          )}
        </div>

        <div className="rounded-lg border border-line bg-midnight p-3">
          <h4 className="mb-2 text-sm font-semibold text-ink">Starter preview</h4>
          {selected ? (
            <div className="space-y-2 text-sm">
              <p className="text-ink">{selected.label}</p>
              {channel === 'email' ? (
                <>
                  <p>
                    <span className="text-muted">Subject: </span>
                    {selected.subject}
                  </p>
                  <p>
                    <span className="text-muted">Preview: </span>
                    {selected.previewText || '—'}
                  </p>
                </>
              ) : null}
              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-muted">
                {selected.body}
              </pre>
              <Button
                className="mt-2"
                onClick={() => requestApply({ type: 'starter', starter: selected })}
              >
                Use this starter
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted">Select a starter to preview it before applying.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title={pendingAction?.type === 'scratch' ? 'Clear current content?' : 'Replace current content?'}
        description={
          pendingAction?.type === 'scratch'
            ? 'This clears the campaign name and message fields so you can write from scratch.'
            : 'This replaces the current campaign name and message fields with the selected starter. You can still edit afterward.'
        }
        confirmLabel={pendingAction?.type === 'scratch' ? 'Clear content' : 'Replace content'}
        tone="danger"
        onConfirm={() => {
          runApply(pendingAction)
          setPendingAction(null)
        }}
      />
    </Card>
  )
}
