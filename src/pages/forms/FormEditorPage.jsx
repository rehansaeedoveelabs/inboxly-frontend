import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  EmptyState,
  LoadingState,
  ErrorState,
  ConfirmDialog,
} from '../../components/ui'
import { FormStudio } from '../../components/forms/studio/FormStudio'
import { ApiError } from '../../lib/api'
import { listStoreAssets, uploadStoreAsset } from '../../lib/assetsApi'
import {
  createStoreForm,
  defaultFormDefinition,
  deleteForm,
  getForm,
  toFormDefinitionPayload,
  toFormEditorState,
  updateForm,
} from '../../lib/formsApi'
import { firstFieldError } from '../../lib/tagsUi'
import { useActiveStore } from '../../store/useActiveStore'

const FORM_TYPES = ['popup', 'embedded', 'landing_page', 'flyout', 'fullscreen']

function normalizeFormType(type) {
  return FORM_TYPES.includes(type) ? type : 'popup'
}

function blankEditor(type) {
  const definition = defaultFormDefinition()
  const resolved = normalizeFormType(type)
  if (resolved === 'embedded' || resolved === 'landing_page') {
    definition.behavior = {
      ...definition.behavior,
      display: 'Always visible',
      devices: 'Show on all devices',
      frequency: 'N/A',
    }
  }
  const names = {
    popup: 'New popup form',
    embedded: 'New embedded form',
    landing_page: 'New landing page form',
    flyout: 'New flyout form',
    fullscreen: 'New fullscreen form',
  }
  return toFormEditorState({
    id: null,
    name: names[resolved] || 'New form',
    type: resolved,
    status: 'draft',
    submissions_count: 0,
    public_token: null,
    embed_url: null,
    definition,
  })
}

export function FormEditorPage() {
  const { formId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const isNew = !formId || formId === 'new'

  const [form, setForm] = useState(() => blankEditor(searchParams.get('type')))
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loadNonce, setLoadNonce] = useState(0)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionError, setActionError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [savedFlash, setSavedFlash] = useState(false)
  const [assets, setAssets] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState('')
  const [assetUploading, setAssetUploading] = useState(false)
  const [assetsNonce, setAssetsNonce] = useState(0)

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    let cancelled = false
    setAssetsLoading(true)
    setAssetsError('')

    listStoreAssets(storeId, { limit: 100 })
      .then((page) => {
        if (cancelled) return
        setAssets(page.data || [])
      })
      .catch((error) => {
        if (cancelled) return
        setAssets([])
        setAssetsError(error instanceof ApiError ? error.message : 'Unable to load images.')
      })
      .finally(() => {
        if (!cancelled) setAssetsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, assetsNonce])

  const refreshAssets = useCallback(() => setAssetsNonce((n) => n + 1), [])

  const uploadAsset = useCallback(
    async (file) => {
      if (!storeId || assetUploading) return
      setAssetUploading(true)
      setAssetsError('')
      try {
        const created = await uploadStoreAsset(storeId, { file })
        setAssets((current) => [created, ...current.filter((row) => row.id !== created.id)])
        return created
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Unable to upload image.'
        setAssetsError(message)
        throw error
      } finally {
        setAssetUploading(false)
      }
    },
    [storeId, assetUploading],
  )

  useEffect(() => {
    if (isNew || storeStatus === 'loading' || !storeId) return undefined

    let cancelled = false
    setLoading(true)
    setLoadError('')
    setNotFound(false)

    getForm(formId)
      .then((resource) => {
        if (cancelled) return
        setForm(toFormEditorState(resource))
        setLoading(false)
      })
      .catch((error) => {
        if (cancelled) return
        setLoading(false)
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
          return
        }
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load form.')
      })

    return () => {
      cancelled = true
    }
  }, [formId, isNew, storeId, storeStatus, loadNonce])

  const persist = async ({ status, closeAfter = false } = {}) => {
    if (!storeId || saving) return null
    if (!form.name.trim()) {
      setFieldErrors({ name: 'Name is required.' })
      return null
    }
    setSaving(true)
    setActionError('')
    setFieldErrors({})
    const payload = {
      name: form.name.trim(),
      type: form.type,
      status: status || form.status,
      definition: toFormDefinitionPayload(form),
    }
    try {
      let resource
      if (isNew || !form.id) {
        resource = await createStoreForm(storeId, payload)
        navigate(`/forms/${resource.id}`, { replace: true })
      } else {
        resource = await updateForm(form.id, payload)
      }
      setForm(toFormEditorState(resource))
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 1400)
      if (closeAfter) navigate('/forms')
      return resource
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message)
        setFieldErrors({
          name: firstFieldError(error.errors, 'name') || undefined,
          definition: firstFieldError(error.errors, 'definition') || undefined,
        })
      } else {
        setActionError('Unable to save the form.')
      }
      return null
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async () => {
    const next = form.status === 'enabled' ? 'draft' : 'enabled'
    await persist({ status: next })
  }

  const remove = async () => {
    if (!form.id || deleting) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteForm(form.id)
      navigate('/forms')
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unable to delete.'
      setActionError(message)
      throw error instanceof Error ? error : new Error(message)
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
        description="Forms are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  if (notFound) {
    return (
      <EmptyState
        title="Form not found"
        description="This form does not exist or is no longer available."
        actionLabel="Back to forms"
        onAction={() => navigate('/forms')}
      />
    )
  }

  if (loading) {
    return <LoadingState label="Loading form…" />
  }

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load form"
        description={loadError}
        onRetry={() => setLoadNonce((n) => n + 1)}
      />
    )
  }

  return (
    <>
      <FormStudio
        form={form}
        onFormChange={setForm}
        saving={saving}
        savedFlash={savedFlash}
        actionError={actionError || fieldErrors.definition || ''}
        nameError={fieldErrors.name || ''}
        onClose={() => navigate('/forms')}
        onSave={() => persist()}
        onSaveAndClose={() => persist({ closeAfter: true })}
        onEnable={toggleEnabled}
        assets={assets}
        assetsLoading={assetsLoading}
        assetsError={assetsError}
        assetUploading={assetUploading}
        onUploadAsset={uploadAsset}
        onRefreshAssets={refreshAssets}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this form?"
        description="This cannot be undone from the UI."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={remove}
      />
    </>
  )
}
