import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import {
  PageHeader,
  Button,
  Table,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  CONTACT_IMPORT_MAX_ROWS,
  filterImportsForStore,
  parseContactImportCsv,
  validateImportFileSize,
} from '../../lib/csvImport'
import { getContactImport, isImportTerminal, pollContactImport, startContactImport } from '../../lib/importsApi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

/**
 * Backend has no import list endpoint. Keep a session-local history of imports
 * started from this page for the active store (plus live poll updates).
 */
const SESSION_KEY = 'inboxly.contactImportHistory.v1'

function readSessionHistory() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessionHistory(items) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(items.slice(0, 50)))
  } catch {
    // Ignore quota / private mode failures.
  }
}

function upsertHistory(items, importRecord) {
  const next = [importRecord, ...items.filter((item) => item.id !== importRecord.id)]
  writeSessionHistory(next)
  return next
}

export function ImportsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [history, setHistory] = useState(() => readSessionHistory())
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [filename, setFilename] = useState('contacts.csv')
  const [tagsInput, setTagsInput] = useState('Imported')
  const [csvText, setCsvText] = useState('')
  const [formError, setFormError] = useState('')
  const [parseWarnings, setParseWarnings] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [banner, setBanner] = useState('')

  const storeHistory = useMemo(
    () => filterImportsForStore(history, storeId),
    [history, storeId],
  )

  const rows = storeHistory.filter((item) => (filter === 'all' ? true : item.status === filter))

  const openIds = useMemo(
    () =>
      storeHistory
        .filter((item) => !isImportTerminal(item.status))
        .map((item) => item.id)
        .join(','),
    [storeHistory],
  )

  useEffect(() => {
    if (!storeId || !openIds) return undefined

    let cancelled = false

    const refreshOpen = async () => {
      const ids = openIds.split(',').filter(Boolean)
      for (const id of ids) {
        try {
          const latest = await getContactImport(id)
          if (cancelled) return
          setHistory((current) => upsertHistory(current, latest))
        } catch {
          // Keep prior status on transient poll errors.
        }
      }
    }

    refreshOpen()
    const interval = window.setInterval(refreshOpen, 2000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [storeId, openIds])

  const onFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFilename(file.name || 'contacts.csv')
    const sizeError = validateImportFileSize(file)
    if (sizeError) {
      setCsvText('')
      setParseWarnings([])
      setFormError(sizeError)
      return
    }
    const text = await file.text()
    setCsvText(text)
    const parsed = parseContactImportCsv(text)
    setParseWarnings(parsed.errors)
    setFormError(parsed.rows.length === 0 && parsed.errors[0] ? parsed.errors[0] : '')
  }

  const startImport = async () => {
    if (!storeId || submitting) return
    setFormError('')
    const parsed = parseContactImportCsv(csvText)
    setParseWarnings(parsed.errors)
    if (parsed.rows.length === 0) {
      setFormError(parsed.errors[0] || 'No valid rows to import.')
      return
    }
    if (parsed.rows.length > CONTACT_IMPORT_MAX_ROWS) {
      setFormError(`At most ${CONTACT_IMPORT_MAX_ROWS} rows can be imported at once.`)
      return
    }

    const tags = tagsInput
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)

    setSubmitting(true)
    try {
      const started = await startContactImport(storeId, {
        rows: parsed.rows,
        tags,
        filename: filename.trim() || null,
      })
      setHistory((current) => upsertHistory(current, started))
      setOpen(false)
      setCsvText('')
      setParseWarnings([])

      if (!isImportTerminal(started.status)) {
        try {
          const final = await pollContactImport(started.id, {
            intervalMs: 1500,
            maxAttempts: 40,
          })
          setHistory((current) => upsertHistory(current, final))
          setBanner('')
        } catch (pollError) {
          // Import was accepted; interval polling continues updating status.
          setBanner(
            pollError instanceof ApiError
              ? `Import started, but status polling failed: ${pollError.message}`
              : 'Import started, but status polling was interrupted. Status will keep refreshing.',
          )
        }
      } else {
        setBanner('')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Unable to start the import.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'original_filename',
      label: 'Import name',
      render: (row) => row.original_filename || 'Contact import',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'created_at',
      label: 'Import date',
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: 'created_count',
      label: 'New contacts',
      render: (row) => row.created_count ?? '—',
    },
    {
      key: 'updated_count',
      label: 'Updated contacts',
      render: (row) => row.updated_count ?? '—',
    },
    {
      key: 'restored_count',
      label: 'Restored',
      render: (row) => row.restored_count ?? '—',
    },
    {
      key: 'failed_rows',
      label: 'Failed rows',
      render: (row) => row.failed_rows ?? '—',
    },
    {
      key: 'processed_rows',
      label: 'Processed',
      render: (row) =>
        row.processed_rows == null || row.total_rows == null
          ? '—'
          : `${row.processed_rows}/${row.total_rows}`,
    },
  ]

  const missingStore = storeStatus !== 'loading' && !storeId

  return (
    <div>
      <PageHeader
        title="Imports"
        description={
          activeStore
            ? `CSV imports for ${activeStore.name}. Matching deleted contacts are restored with prior consents and require review before marketing.`
            : 'Import contacts from CSV for the active store.'
        }
        actions={
          <Button onClick={() => setOpen(true)} disabled={!storeId}>
            <Upload className="size-4" />
            Add or update contacts
          </Button>
        }
      />

      {banner ? (
        <p className="mb-3 text-sm text-warning" role="status">
          {banner}
        </p>
      ) : null}

      {storeStatus === 'loading' ? <LoadingState label="Loading store…" /> : null}

      {missingStore ? (
        <EmptyState
          icon={Upload}
          title="Select a store"
          description="Imports are scoped to a store."
          actionLabel="Go to Store settings"
          onAction={() => navigate('/settings/store')}
        />
      ) : null}

      {storeId ? (
        <div className="mb-3 flex justify-end">
          <Select className="w-40" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All imports</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      ) : null}

      {storeId && rows.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No imports in this session"
          description="Start a CSV import. History is kept for this browser session because the API has no import index."
          actionLabel="Start import"
          onAction={() => setOpen(true)}
        />
      ) : null}

      {storeId && rows.length > 0 ? <Table columns={columns} rows={rows} /> : null}

      {storeId && rows.some((row) => row.error_summary) ? (
        <div className="mt-3 space-y-2">
          {rows
            .filter((row) => row.error_summary)
            .map((row) => (
              <ErrorState
                key={`${row.id}-errors`}
                title={`${row.original_filename || 'Import'} issues`}
                description={row.error_summary}
              />
            ))}
        </div>
      ) : null}

      <Modal
        open={open}
        onClose={() => {
          if (!submitting) setOpen(false)
        }}
        title="Import contacts"
        footer={
          <>
            <Button variant="ghost" disabled={submitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={submitting || !storeId} onClick={startImport}>
              {submitting ? 'Importing…' : 'Start import'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {formError ? (
            <p className="text-sm text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <FormField label="Filename">
            <Input
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              disabled={submitting}
            />
          </FormField>
          <FormField
            label="Tags to apply"
            hint="Comma-separated names (created if missing)."
          >
            <Input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              disabled={submitting}
              placeholder="Imported, Spring Sale"
            />
          </FormField>
          <FormField
            label="CSV file"
            hint={`Header must include email. Optional: first_name, last_name, phone, locale, timezone, source. Max ${CONTACT_IMPORT_MAX_ROWS} rows (JSON payload, not multipart upload).`}
          >
            <Input type="file" accept=".csv,text/csv" onChange={onFileChange} disabled={submitting} />
          </FormField>
          <p className="text-xs text-muted">
            Rows that match a deleted contact restore that contact and keep its prior consent
            statuses. Restored contacts are not marketing-eligible until consent is reviewed on
            the contact page.
          </p>
          {parseWarnings.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted">
              {parseWarnings.slice(0, 5).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
