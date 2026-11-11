/**
 * Minimal CSV → import rows helper (header row required).
 * Matches StartContactImportRequest: email required; optional first_name, last_name,
 * phone, locale, timezone, source, metadata. Max 1000 rows (Laravel MAX_ROWS).
 */

/** Mirrors App\Http\Requests\Audience\StartContactImportRequest::MAX_ROWS */
export const CONTACT_IMPORT_MAX_ROWS = 1000

/** Soft cap before reading a file into memory (JSON rows payload; not multipart). */
export const CONTACT_IMPORT_MAX_FILE_BYTES = 1_500_000

const KNOWN = new Set([
  'email',
  'first_name',
  'last_name',
  'phone',
  'locale',
  'timezone',
  'source',
])

/**
 * Split a CSV line respecting simple double-quoted fields.
 * @param {string} line
 * @returns {string[]}
 */
export function splitCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current)
  return cells.map((cell) => cell.trim())
}

/**
 * @param {{ size?: number } | null | undefined} file
 * @returns {string | null} error message when the file should not be read
 */
export function validateImportFileSize(file) {
  const size = file?.size
  if (typeof size !== 'number' || Number.isNaN(size)) return null
  if (size > CONTACT_IMPORT_MAX_FILE_BYTES) {
    return `CSV is too large to load in the browser (max ${Math.floor(CONTACT_IMPORT_MAX_FILE_BYTES / 1000)} KB). Split the file into batches of at most ${CONTACT_IMPORT_MAX_ROWS} rows.`
  }
  return null
}

/**
 * @param {string} text
 * @param {{ maxRows?: number }} [options]
 * @returns {{ rows: Array<Record<string, string>>, errors: string[] }}
 */
export function parseContactImportCsv(text, { maxRows = CONTACT_IMPORT_MAX_ROWS } = {}) {
  const errors = []
  const raw = String(text || '').replace(/^\uFEFF/, '')
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV needs a header row and at least one data row.'] }
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  if (!headers.includes('email')) {
    return { rows: [], errors: ['CSV must include an email column.'] }
  }

  const dataLineCount = lines.length - 1
  if (dataLineCount > maxRows) {
    return {
      rows: [],
      errors: [
        `CSV has ${dataLineCount} data rows; the API accepts at most ${maxRows} rows per import.`,
      ],
    }
  }

  const rows = []
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i])
    const row = {}
    headers.forEach((header, index) => {
      if (!KNOWN.has(header)) return
      const value = cells[index] ?? ''
      if (value !== '') row[header] = value
    })
    if (!row.email) {
      errors.push(`Row ${i + 1}: missing email.`)
      continue
    }
    rows.push(row)
  }

  if (rows.length === 0) {
    errors.push('No valid rows with an email were found.')
  }

  return { rows, errors }
}

/**
 * Session import history filtered to the active store — never show another store's imports.
 *
 * @param {Array<{ store_id?: string }>} history
 * @param {string | null | undefined} storeId
 */
export function filterImportsForStore(history, storeId) {
  if (!storeId) return []
  const list = Array.isArray(history) ? history : []
  return list.filter((item) => item?.store_id === storeId)
}
