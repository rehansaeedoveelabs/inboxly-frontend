import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, ConfirmDialog, FormField, Input, Textarea } from '../ui'
import { ApiError } from '../../lib/api'
import {
  appendUtmParams,
  createCampaignMetaPublications,
  getCampaignMetaEligiblePages,
  listCampaignMetaPublications,
  publicationStatusLabel,
  reconcileCampaignMetaPublication,
  resolveCampaignMetaPublication,
  retryCampaignMetaPublication,
  updateCampaignSocialContent,
} from '../../lib/campaignMetaApi'
import { defaultSelectedPageIds, publicationStatusTone } from '../../lib/campaignMetaUi'
import { formatDateTime } from '../../lib/format'

/**
 * Side-channel Facebook publishing for a campaign (independent of email send).
 */
export function CampaignFacebookPublishPanel({ campaign, onCampaignUpdated }) {
  const [message, setMessage] = useState(campaign?.meta_message || '')
  const [link, setLink] = useState(campaign?.meta_link || '')
  const [eligible, setEligible] = useState(null)
  const [selectedPageIds, setSelectedPageIds] = useState([])
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmRepublish, setConfirmRepublish] = useState(false)
  const [resolveState, setResolveState] = useState(null)
  const [resolvePostId, setResolvePostId] = useState('')

  const load = useCallback(async () => {
    if (!campaign?.id) return
    setLoading(true)
    setError('')
    try {
      const [pagesPayload, pubs] = await Promise.all([
        getCampaignMetaEligiblePages(campaign.id),
        listCampaignMetaPublications(campaign.id),
      ])
      setEligible(pagesPayload)
      setPublications(pubs)
      setSelectedPageIds((current) => defaultSelectedPageIds(pagesPayload.pages || [], current))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Facebook publishing.')
    } finally {
      setLoading(false)
    }
  }, [campaign?.id])

  useEffect(() => {
    setMessage(campaign?.meta_message || '')
    setLink(campaign?.meta_link || '')
  }, [campaign?.meta_message, campaign?.meta_link, campaign?.id])

  useEffect(() => {
    load()
  }, [load])

  const previewLink = useMemo(() => {
    if (!link.trim() || !campaign?.id) return ''
    return appendUtmParams(link.trim(), {
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: campaign.id,
    })
  }, [link, campaign?.id])

  const publishablePages = (eligible?.pages || []).filter((page) => page.can_publish)

  const togglePage = (pageId) => {
    setSelectedPageIds((current) =>
      current.includes(pageId) ? current.filter((id) => id !== pageId) : [...current, pageId],
    )
  }

  const onSaveContent = async () => {
    if (!campaign?.id || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const updated = await updateCampaignSocialContent(campaign.id, {
        message,
        link: link.trim() === '' ? null : link.trim(),
      })
      setNotice('Facebook content saved.')
      onCampaignUpdated?.(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save Facebook content.')
    } finally {
      setBusy(false)
    }
  }

  const requestPublish = () => {
    if (!campaign?.id || busy) return
    if (selectedPageIds.length === 0) {
      setError('Select at least one Facebook Page.')
      return
    }
    if (!message.trim()) {
      setError('Enter a Facebook message before publishing.')
      return
    }
    setError('')
    setConfirmPublish(true)
  }

  const onPublishConfirmed = async () => {
    if (!campaign?.id) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await updateCampaignSocialContent(campaign.id, {
        message,
        link: link.trim() === '' ? null : link.trim(),
      })
      let rows
      try {
        rows = await createCampaignMetaPublications(campaign.id, {
          metaPageIds: selectedPageIds,
          confirmRepublish,
        })
      } catch (err) {
        if (
          err instanceof ApiError &&
          err.status === 422 &&
          err.errors?.confirm_republish &&
          !confirmRepublish
        ) {
          setConfirmRepublish(true)
          // Keep the confirm dialog open (ConfirmDialog closes only on resolve).
          throw new Error(
            'This content was already published. Confirm again to intentionally create another Facebook post (duplicate risk).',
          )
        }
        throw err
      }
      setConfirmRepublish(false)
      setPublications((current) => {
        const byId = new Map(current.map((row) => [row.id, row]))
        for (const row of rows) byId.set(row.id, row)
        return Array.from(byId.values()).sort((a, b) =>
          String(b.created_at || '').localeCompare(String(a.created_at || '')),
        )
      })
      const simulated = rows.some((row) => row.simulated)
      setNotice(
        simulated
          ? 'Simulated publication recorded (fake Meta driver). Not a real Facebook post.'
          : 'Facebook publication queued.',
      )
      await load()
    } catch (err) {
      const messageText = err instanceof ApiError ? err.message : 'Unable to publish to Facebook.'
      setError(messageText)
      throw err
    } finally {
      setBusy(false)
    }
  }

  const onRetry = async (publicationId) => {
    if (!campaign?.id || busy) return
    setBusy(true)
    setError('')
    try {
      await retryCampaignMetaPublication(campaign.id, publicationId)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to retry publication.')
    } finally {
      setBusy(false)
    }
  }

  const onReconcile = async (publicationId) => {
    if (!campaign?.id || busy) return
    setBusy(true)
    setError('')
    try {
      await reconcileCampaignMetaPublication(campaign.id, publicationId)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reconcile publication.')
    } finally {
      setBusy(false)
    }
  }

  const onResolveFailed = async () => {
    if (!campaign?.id || resolveState?.mode !== 'failed') return
    setBusy(true)
    setError('')
    try {
      await resolveCampaignMetaPublication(campaign.id, resolveState.id, {
        resolution: 'mark_failed',
        acknowledgeDuplicateRisk: true,
      })
      setResolveState(null)
      setResolvePostId('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resolve publication.')
      throw err
    } finally {
      setBusy(false)
    }
  }

  const onResolvePublished = async () => {
    if (!campaign?.id || resolveState?.mode !== 'published') return
    setBusy(true)
    setError('')
    try {
      await resolveCampaignMetaPublication(campaign.id, resolveState.id, {
        resolution: 'mark_published',
        acknowledgeVerifiedOnFacebook: true,
        providerPostId: resolvePostId.trim() || null,
      })
      setResolveState(null)
      setResolvePostId('')
      setNotice('Publication marked as published after Facebook verification.')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resolve publication.')
      throw err
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="mt-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Facebook Page publishing</h3>
          <p className="mt-1 text-sm text-muted">
            Separate from email delivery. Write a Facebook message — do not paste email HTML.
          </p>
        </div>
        <Link
          to="/settings/meta"
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-secondary px-3.5 text-sm font-medium text-ink hover:bg-secondary/80"
        >
          Meta settings
        </Link>
      </div>

      {error ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mb-3 text-sm text-success" role="status">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading Facebook Pages…</p>
      ) : (
        <>
          {eligible?.needs_reauth ? (
            <p className="mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
              Meta requires reauthentication before publishing.{' '}
              <Link className="underline" to="/settings/meta">
                Reconnect Meta
              </Link>
              .
            </p>
          ) : null}

          {eligible && !eligible.connection_usable && !eligible.needs_reauth ? (
            <p className="mb-3 rounded-md border border-line bg-midnight px-3 py-2 text-sm text-muted">
              Connect Meta and select a publish-capable Page in{' '}
              <Link className="text-electric underline" to="/settings/meta">
                Meta settings
              </Link>
              .
              {eligible.missing_scopes?.length
                ? ` Missing permissions: ${eligible.missing_scopes.join(', ')}.`
                : null}
            </p>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-3">
              <FormField label="Facebook message" htmlFor="meta-message">
                <Textarea
                  id="meta-message"
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write the Page post text…"
                />
              </FormField>
              <FormField label="Destination URL (optional)" htmlFor="meta-link">
                <Input
                  id="meta-link"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="https://…"
                />
              </FormField>
              {previewLink ? (
                <p className="text-xs text-muted break-all">
                  Link with UTMs: <span className="text-ink">{previewLink}</span>
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" disabled={busy} onClick={onSaveContent}>
                  Save Facebook content
                </Button>
                <Button
                  disabled={busy || !eligible?.connection_usable || selectedPageIds.length === 0}
                  onClick={requestPublish}
                >
                  Publish to Facebook
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Publish-capable Pages</p>
              {publishablePages.length === 0 ? (
                <p className="text-sm text-muted">No selected Pages with CREATE_CONTENT.</p>
              ) : (
                <ul className="space-y-2">
                  {publishablePages.map((page) => (
                    <li key={page.id}>
                      <label className="flex cursor-pointer items-start gap-2 rounded-md border border-line bg-midnight px-3 py-2">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedPageIds.includes(page.id)}
                          onChange={() => togglePage(page.id)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm text-ink">{page.name}</span>
                          <span className="text-xs text-muted">{page.meta_page_id}</span>
                          {page.is_default ? (
                            <Badge tone="info" className="mt-1">
                              Default
                            </Badge>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5">
            <h4 className="mb-2 text-sm font-semibold text-ink">Publication history</h4>
            {publications.length === 0 ? (
              <p className="text-sm text-muted">No Facebook publications yet.</p>
            ) : (
              <ul className="space-y-2">
                {publications.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-md border border-line bg-midnight px-3 py-3 text-sm"
                    data-publication-status={row.status}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{row.page?.name || 'Page'}</p>
                        <p className="text-xs text-muted">{formatDateTime(row.created_at)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={publicationStatusTone(row.status)}>
                          {publicationStatusLabel(row.status)}
                        </Badge>
                        {row.simulated ? <Badge tone="warning">Simulated</Badge> : null}
                      </div>
                    </div>
                    {row.provider_post_id ? (
                      <p className="mt-1 text-xs text-muted break-all">Post ID: {row.provider_post_id}</p>
                    ) : null}
                    {row.error_message ? (
                      <p className="mt-1 text-xs text-danger">{row.error_message}</p>
                    ) : null}
                    {row.status === 'outcome_unknown' ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="secondary" disabled={busy} onClick={() => onReconcile(row.id)}>
                            Reconcile
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => {
                              setResolvePostId(row.provider_post_id || '')
                              setResolveState({ id: row.id, mode: 'published' })
                            }}
                          >
                            Mark published
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => setResolveState({ id: row.id, mode: 'failed' })}
                          >
                            Mark failed
                          </Button>
                        </div>
                        <p className="text-xs text-warning">
                          Outcome unknown — reconcile with Meta feed evidence, or resolve only after checking
                          Facebook. Marking failed risks duplicates on later publish.
                        </p>
                      </div>
                    ) : null}
                    {row.status === 'failed' ? (
                      <div className="mt-2">
                        <Button size="sm" variant="secondary" disabled={busy} onClick={() => onRetry(row.id)}>
                          Retry
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => {
          setConfirmPublish(false)
          setConfirmRepublish(false)
        }}
        title={confirmRepublish ? 'Publish identical content again?' : 'Publish to Facebook?'}
        description={
          confirmRepublish
            ? `This intentionally creates another Facebook post with the same content on ${selectedPageIds.length} Page(s). A duplicate may already exist. It does not send the email campaign.`
            : `This posts to ${selectedPageIds.length} selected Page(s). It does not send the email campaign.`
        }
        confirmLabel={confirmRepublish ? 'Publish again' : 'Publish'}
        onConfirm={onPublishConfirmed}
      />

      <ConfirmDialog
        open={resolveState?.mode === 'failed'}
        onClose={() => setResolveState(null)}
        title="Mark Facebook publication failed?"
        description="Only do this after checking the Facebook Page. A post may already exist. Marking failed allows retry or a new publish and risks duplicates."
        confirmLabel="Mark failed"
        tone="danger"
        onConfirm={onResolveFailed}
      />

      <ConfirmDialog
        open={resolveState?.mode === 'published'}
        onClose={() => {
          setResolveState(null)
          setResolvePostId('')
        }}
        title="Mark Facebook publication as published?"
        description="Confirm you independently verified this post on Facebook. This does not publish again."
        confirmLabel="Mark published"
        onConfirm={onResolvePublished}
      >
        <FormField label="Provider post ID (optional)" htmlFor="resolve-post-id" className="mt-3">
          <Input
            id="resolve-post-id"
            value={resolvePostId}
            onChange={(event) => setResolvePostId(event.target.value)}
            placeholder="Facebook post ID if known"
          />
        </FormField>
      </ConfirmDialog>
    </Card>
  )
}
