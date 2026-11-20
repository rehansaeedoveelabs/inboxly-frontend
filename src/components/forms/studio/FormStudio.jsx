import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  History,
  Info,
  Monitor,
  Pencil,
  Redo2,
  Smartphone,
  Undo2,
} from 'lucide-react'
import { cn } from '../../../lib/cn'
import { FormStudioItems, createFormField } from './FormStudioItems'
import { FormStudioCanvas } from './FormStudioCanvas'
import { FormStudioInspector } from './FormStudioInspector'

const HISTORY_LIMIT = 40
const GAME_TYPES = new Set(['wheel', 'mystery', 'scratch', 'plinko', 'pick_card', 'countdown'])

function cloneForm(form) {
  return structuredClone(form)
}

/**
 * Full-screen Omnisend-style form editor.
 */
export function FormStudio({
  form,
  onFormChange,
  saving = false,
  savedFlash = false,
  actionError = '',
  nameError = '',
  onSave,
  onSaveAndClose,
  onEnable,
  onClose,
  assets = [],
  assetsLoading = false,
  assetsError = '',
  assetUploading = false,
  onUploadAsset,
  onRefreshAssets,
}) {
  const [device, setDevice] = useState('desktop')
  const [step, setStep] = useState('form')
  const [inspectorTab, setInspectorTab] = useState('behavior')
  const [openSection, setOpenSection] = useState('install')
  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const [contentSelected, setContentSelected] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [historyTick, setHistoryTick] = useState(0)

  const historyRef = useRef({ past: [], future: [] })
  const skipHistoryRef = useRef(false)
  const formRef = useRef(form)
  formRef.current = form

  const selectedField = useMemo(
    () => (form.fields || []).find((field) => field.id === selectedFieldId) || null,
    [form.fields, selectedFieldId],
  )

  const bumpHistory = () => setHistoryTick((value) => value + 1)

  const pushHistory = (prev) => {
    const hist = historyRef.current
    hist.past.push(cloneForm(prev))
    if (hist.past.length > HISTORY_LIMIT) hist.past.shift()
    hist.future = []
    bumpHistory()
  }

  const commit = (updater) => {
    const prev = formRef.current
    const next = typeof updater === 'function' ? updater(prev) : updater
    if (!skipHistoryRef.current) pushHistory(prev)
    onFormChange(next)
  }

  const undo = () => {
    const hist = historyRef.current
    if (hist.past.length === 0) return
    hist.future.unshift(cloneForm(formRef.current))
    const prev = hist.past.pop()
    skipHistoryRef.current = true
    onFormChange(prev)
    skipHistoryRef.current = false
    bumpHistory()
  }

  const redo = () => {
    const hist = historyRef.current
    if (hist.future.length === 0) return
    hist.past.push(cloneForm(formRef.current))
    const next = hist.future.shift()
    skipHistoryRef.current = true
    onFormChange(next)
    skipHistoryRef.current = false
    bumpHistory()
  }

  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    const onKey = (event) => {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }
      if (meta && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        event.preventDefault()
        redo()
      }
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault()
        onSaveRef.current?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // undo/redo close over historyRef — stable enough for the studio session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canUndo = historyTick >= 0 && historyRef.current.past.length > 0
  const canRedo = historyTick >= 0 && historyRef.current.future.length > 0

  const addField = (field) => {
    commit((current) => {
      let fields = [...(current.fields || [])]
      const isGame = GAME_TYPES.has(field.type)
      if (isGame) {
        fields = fields.filter((row) => !GAME_TYPES.has(row.type))
      }
      fields.push(field)
      return {
        ...current,
        fields,
        layout: isGame ? 'split' : current.layout,
        tags: isGame
          ? Array.from(new Set([...(current.tags || []), 'branded_wof', 'form_subscriber']))
          : current.tags,
      }
    })
    setSelectedFieldId(field.id)
    setContentSelected(null)
    setInspectorTab('theme')
  }

  const patchForm = (patch) => commit((current) => ({ ...current, ...patch }))
  const patchBehavior = (patch) =>
    commit((current) => ({
      ...current,
      behavior: { ...(current.behavior || {}), ...patch },
    }))
  const patchTheme = (patch) =>
    commit((current) => ({
      ...current,
      theme: { ...(current.theme || {}), ...patch },
    }))
  const patchSuccess = (patch) =>
    commit((current) => ({
      ...current,
      success: { ...(current.success || {}), ...patch },
    }))
  const patchField = (id, patch) =>
    commit((current) => ({
      ...current,
      fields: (current.fields || []).map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    }))
  const removeField = (id) => {
    commit((current) => ({
      ...current,
      fields: (current.fields || []).filter((field) => field.id !== id),
    }))
    setSelectedFieldId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1f1f1f] text-white">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded bg-[#14b8a6] text-[11px] font-bold text-white"
            title="Back to forms"
          >
            i
          </button>
          {editingName ? (
            <input
              autoFocus
              value={form.name}
              onChange={(event) => patchForm({ name: event.target.value })}
              onBlur={() => setEditingName(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setEditingName(false)
              }}
              className="min-w-0 flex-1 truncate border-0 bg-transparent text-[13px] font-semibold outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="min-w-0 truncate text-left text-[13px] font-semibold"
            >
              {form.name || 'Untitled form'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="inline-flex items-center gap-1 text-[12px] text-[#14b8a6] hover:underline"
          >
            <Pencil className="size-3" />
            Edit
          </button>
          {nameError ? <span className="text-[11px] text-[#f87171]">{nameError}</span> : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="inline-flex items-center gap-1.5 text-[12px] text-[#9a9a9a]">
            <Info className="size-3.5" />
            Data is collected in every step
          </div>
          <div className="flex items-center rounded-md border border-[#333] p-0.5">
            <button
              type="button"
              aria-label="Desktop"
              onClick={() => setDevice('desktop')}
              className={cn(
                'rounded p-1.5',
                device === 'desktop' ? 'bg-[#2a2a2a] text-white' : 'text-[#8a8a8a] hover:text-white',
              )}
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Mobile"
              onClick={() => setDevice('mobile')}
              className={cn(
                'rounded p-1.5',
                device === 'mobile' ? 'bg-[#2a2a2a] text-white' : 'text-[#8a8a8a] hover:text-white',
              )}
            >
              <Smartphone className="size-3.5" />
            </button>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={undo}
              className="rounded p-1.5 text-[#8a8a8a] hover:text-white disabled:opacity-30"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              type="button"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={redo}
              className="rounded p-1.5 text-[#8a8a8a] hover:text-white disabled:opacity-30"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded p-1.5 text-[#8a8a8a] hover:text-white sm:inline-flex"
            title="History"
          >
            <History className="size-3.5" />
          </button>
          <div className="relative">
            <button
              type="button"
              disabled={saving}
              onClick={onSaveAndClose || onSave}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-[#3a3a3a] bg-[#2a2a2a] px-3 text-[12px] font-medium text-white hover:bg-[#333] disabled:opacity-50"
            >
              {saving ? 'Saving…' : savedFlash ? 'Saved' : 'Save & Close'}
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onEnable}
            className="inline-flex h-8 items-center rounded-md bg-[#14b8a6] px-3 text-[12px] font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            {form.status === 'enabled' ? 'Disable form' : 'Enable form'}
          </button>
        </div>
      </header>

      {actionError ? (
        <div className="shrink-0 border-b border-[#7f1d1d] bg-[#450a0a] px-4 py-2 text-[12px] text-[#fecaca]" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <FormStudioItems onAdd={addField} disabled={step === 'success'} />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <FormStudioCanvas
            form={form}
            step={step}
            device={device}
            selectedFieldId={selectedFieldId}
            contentSelected={contentSelected}
            onSelectField={(id) => {
              setSelectedFieldId(id)
              setContentSelected(null)
              setInspectorTab('theme')
            }}
            onSelectHeadline={() => {
              setSelectedFieldId(null)
              setContentSelected('headline')
              setInspectorTab('theme')
            }}
          />

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#3a3a3a] bg-[#1a1a1a]/95 px-2 py-1.5 shadow-xl backdrop-blur">
            <button
              type="button"
              onClick={() => setStep('form')}
              className={cn(
                'rounded-full px-3 py-1 text-[12px] font-medium',
                step === 'form' ? 'bg-[#2f2f2f] text-white' : 'text-[#9a9a9a] hover:text-white',
              )}
            >
              Form
            </button>
            <span className="text-[#555]">›</span>
            <button
              type="button"
              onClick={() => setStep('success')}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium',
                step === 'success' ? 'bg-[#2f2f2f] text-white' : 'text-[#9a9a9a] hover:text-white',
              )}
            >
              Success
              <ChevronDown className="size-3 opacity-60" />
            </button>
            <button
              type="button"
              onClick={() => addField(createFormField('email'))}
              className="ml-1 flex size-6 items-center justify-center rounded-full bg-[#2f2f2f] text-[#cfcfcf] hover:bg-[#3a3a3a]"
              title="Add step item"
            >
              +
            </button>
          </div>
        </div>

        <FormStudioInspector
          tab={inspectorTab}
          onTabChange={setInspectorTab}
          form={form}
          selectedField={selectedField}
          selectedFieldId={selectedFieldId}
          contentSelected={contentSelected}
          openSection={openSection}
          onOpenSection={setOpenSection}
          onPatchForm={patchForm}
          onPatchField={patchField}
          onPatchBehavior={patchBehavior}
          onPatchTheme={patchTheme}
          onPatchSuccess={patchSuccess}
          onRemoveField={removeField}
          assets={assets}
          assetsLoading={assetsLoading}
          assetsError={assetsError}
          assetUploading={assetUploading}
          onUploadAsset={onUploadAsset}
          onRefreshAssets={onRefreshAssets}
        />
      </div>
    </div>
  )
}
