import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ConfirmDialog,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/ui'
import { EmailTemplateStudio } from '../../components/emailTemplates/studio/EmailTemplateStudio'
import { ApiError } from '../../lib/api'
import { listStoreAssets, uploadStoreAsset } from '../../lib/assetsApi'
import { applyCampaignTemplate } from '../../lib/campaignsApi'
import {
  clearCampaignTemplatePick,
  finishCampaignTemplatePick,
  getCampaignTemplatePick,
} from '../../lib/campaignTemplatePick'
import { personalizeEmailDocument } from '../../lib/emailTemplateCatalog'
import {
  deleteEmailTemplate,
  emptyEmailDocument,
  getEmailTemplate,
  previewEmailDocument,
  updateEmailTemplate,
} from '../../lib/emailTemplatesApi'
import { firstFieldError } from '../../lib/tagsUi'
import { useActiveStore } from '../../store/useActiveStore'

export function EmailTemplateEditorPage() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const shopName = activeStore?.name || activeStore?.shopify_shop_domain || 'Your shop'
  const [pickContext] = useState(() => getCampaignTemplatePick())
  const pickingForCampaign = Boolean(pickContext?.campaignId)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loadNonce, setLoadNonce] = useState(0)
  const [readyForLivePreview, setReadyForLivePreview] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('general')
  const [status, setStatus] = useState('draft')
  const [document, setDocument] = useState(emptyEmailDocument())
  const [assets, setAssets] = useState([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState('')
  const [assetUploading, setAssetUploading] = useState(false)
  const [assetsNonce, setAssetsNonce] = useState(0)

  const [previewHtml, setPreviewHtml] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const previewRequestId = useRef(0)

  const [saving, setSaving] = useState(false)
  const [usingInCampaign, setUsingInCampaign] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionError, setActionError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId || !templateId) return undefined

    let cancelled = false
    setLoading(true)
    setReadyForLivePreview(false)
    setLoadError('')
    setNotFound(false)

    getEmailTemplate(templateId)
      .then((template) => {
        if (cancelled) return
        setName(template.name || '')
        setCategory(template.category || 'general')
        setStatus(template.status || 'draft')
        setDocument(template.document || emptyEmailDocument())
        setPreviewHtml(template.html || '')
        setLoading(false)
        setReadyForLivePreview(true)
      })
      .catch((error) => {
        if (cancelled) return
        setLoading(false)
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
          return
        }
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load template.')
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, templateId, loadNonce])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    let cancelled = false
    setAssetsLoading(true)
    setAssetsError('')

    listStoreAssets(storeId, { limit: 100 })
      .then((assetPage) => {
        if (cancelled) return
        setAssets(assetPage.data || [])
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
        throw error instanceof ApiError ? error : new Error(message)
      } finally {
        setAssetUploading(false)
      }
    },
    [storeId, assetUploading],
  )

  useEffect(() => {
    if (!readyForLivePreview || !storeId) return undefined

    const requestId = ++previewRequestId.current
    const timer = window.setTimeout(() => {
      setPreviewLoading(true)
      setPreviewError('')
      const personalized = personalizeEmailDocument(document, {
        shopName,
        firstName: 'Alex',
        discountCode: 'SAVE20',
      })
      previewEmailDocument(storeId, personalized)
        .then((result) => {
          if (previewRequestId.current !== requestId) return
          setPreviewHtml(result.html)
        })
        .catch((error) => {
          if (previewRequestId.current !== requestId) return
          setPreviewError(error instanceof ApiError ? error.message : 'Unable to preview.')
          if (error instanceof ApiError && error.errors?.document) {
            setFieldErrors((current) => ({
              ...current,
              document: firstFieldError(error.errors, 'document'),
            }))
          }
        })
        .finally(() => {
          if (previewRequestId.current === requestId) setPreviewLoading(false)
        })
    }, 450)

    return () => window.clearTimeout(timer)
  }, [document, readyForLivePreview, shopName, storeId])

  const runPreview = async () => {
    if (!storeId || previewLoading) return
    const requestId = ++previewRequestId.current
    setPreviewLoading(true)
    setPreviewError('')
    try {
      const personalized = personalizeEmailDocument(document, {
        shopName,
        firstName: 'Alex',
        discountCode: 'SAVE20',
      })
      const result = await previewEmailDocument(storeId, personalized)
      if (previewRequestId.current === requestId) setPreviewHtml(result.html)
    } catch (error) {
      if (previewRequestId.current !== requestId) return
      setPreviewError(error instanceof ApiError ? error.message : 'Unable to preview.')
      if (error instanceof ApiError && error.errors?.document) {
        setFieldErrors({ document: firstFieldError(error.errors, 'document') })
      }
    } finally {
      if (previewRequestId.current === requestId) setPreviewLoading(false)
    }
  }

  const save = async () => {
    if (!templateId || saving) return null
    if (!name.trim()) {
      setFieldErrors({ name: 'Name is required.' })
      return null
    }
    setSaving(true)
    setActionError('')
    setFieldErrors({})
    try {
      const updated = await updateEmailTemplate(templateId, {
        name: name.trim(),
        category,
        status,
        document,
      })
      setPreviewHtml(updated.html || '')
      setDocument(updated.document || document)
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 1800)
      return updated
    } catch (error) {
      if (error instanceof ApiError) {
        setActionError(error.message)
        setFieldErrors({
          name: firstFieldError(error.errors, 'name') || undefined,
          document: firstFieldError(error.errors, 'document') || undefined,
        })
      } else {
        setActionError('Unable to save the template.')
      }
      return null
    } finally {
      setSaving(false)
    }
  }

  const useInCampaign = async () => {
    if (!templateId || usingInCampaign || !pickingForCampaign) return
    if (!name.trim()) {
      setFieldErrors({ name: 'Name is required.' })
      return
    }
    setUsingInCampaign(true)
    setActionError('')
    setFieldErrors({})
    try {
      await updateEmailTemplate(templateId, {
        name: name.trim(),
        category,
        status: status === 'draft' ? 'published' : status,
        document,
      })
      const returned = await finishCampaignTemplatePick({
        templateId,
        navigate,
        applyFn: applyCampaignTemplate,
      })
      if (!returned) {
        setActionError(
          'Campaign pick context expired. Open Browse my templates from the campaign again.',
        )
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to use this template in the campaign.',
      )
    } finally {
      setUsingInCampaign(false)
    }
  }

  const closeStudio = () => {
    if (pickingForCampaign) {
      const returnTo = pickContext?.returnTo
      clearCampaignTemplatePick()
      if (returnTo) {
        navigate(returnTo)
        return
      }
    }
    navigate('/resources/templates')
  }

  const remove = async () => {
    if (!templateId || deleting) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteEmailTemplate(templateId)
      navigate('/resources/templates')
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
        description="Email templates are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  if (notFound) {
    return (
      <EmptyState
        title="Template not found"
        description="This template does not exist or is no longer available."
        actionLabel="Back to templates"
        onAction={() => navigate('/resources/templates')}
      />
    )
  }

  if (loading) {
    return <LoadingState label="Loading template…" />
  }

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load template"
        description={loadError}
        onRetry={() => setLoadNonce((n) => n + 1)}
      />
    )
  }

  return (
    <>
      <EmailTemplateStudio
        name={name}
        onNameChange={setName}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
        document={document}
        onDocumentChange={setDocument}
        previewHtml={previewHtml}
        previewLoading={previewLoading}
        previewError={previewError}
        shopName={shopName}
        assets={assets}
        assetsLoading={assetsLoading}
        assetsError={assetsError}
        assetUploading={assetUploading}
        saving={saving}
        savedFlash={savedFlash}
        pickingForCampaign={pickingForCampaign}
        usingInCampaign={usingInCampaign}
        onClose={closeStudio}
        onSave={save}
        onUseInCampaign={useInCampaign}
        onRefreshPreview={runPreview}
        onUploadAsset={uploadAsset}
        onRefreshAssets={refreshAssets}
        onDelete={pickingForCampaign ? undefined : () => setConfirmDelete(true)}
        nameError={fieldErrors.name}
        actionError={actionError || fieldErrors.document || previewError}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this template?"
        description="Campaigns that already applied it keep their snapshot."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={remove}
      />
    </>
  )
}
