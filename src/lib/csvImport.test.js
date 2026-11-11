import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CONTACT_IMPORT_MAX_ROWS,
  filterImportsForStore,
  parseContactImportCsv,
  splitCsvLine,
  validateImportFileSize,
} from './csvImport.js'

describe('csvImport', () => {
  it('splits quoted CSV fields', () => {
    assert.deepEqual(splitCsvLine('a,"b,c",d'), ['a', 'b,c', 'd'])
  })

  it('parses contact import rows and requires email', () => {
    const { rows, errors } = parseContactImportCsv(
      'email,first_name,phone,unknown\na@x.com,Ada,+1555,skip\n,NoEmail,\n',
    )
    assert.equal(rows.length, 1)
    assert.deepEqual(rows[0], { email: 'a@x.com', first_name: 'Ada', phone: '+1555' })
    assert.ok(errors.some((e) => e.includes('missing email')))
  })

  it('rejects CSV without email header', () => {
    const { rows, errors } = parseContactImportCsv('name\nAda')
    assert.equal(rows.length, 0)
    assert.ok(errors[0].includes('email column'))
  })

  it('rejects CSVs over the Laravel row limit before building rows', () => {
    const header = 'email'
    const lines = [header, ...Array.from({ length: CONTACT_IMPORT_MAX_ROWS + 1 }, (_, i) => `u${i}@x.com`)]
    const { rows, errors } = parseContactImportCsv(lines.join('\n'))
    assert.equal(rows.length, 0)
    assert.ok(errors[0].includes(String(CONTACT_IMPORT_MAX_ROWS)))
  })

  it('validates file size before reading into memory', () => {
    assert.equal(validateImportFileSize({ size: 100 }), null)
    assert.ok(validateImportFileSize({ size: 5_000_000 })?.includes('too large'))
  })

  it('filters import history to the active store only', () => {
    const history = [
      { id: '1', store_id: 'A' },
      { id: '2', store_id: 'B' },
      { id: '3', store_id: 'A' },
    ]
    assert.deepEqual(
      filterImportsForStore(history, 'A').map((i) => i.id),
      ['1', '3'],
    )
    assert.deepEqual(filterImportsForStore(history, null), [])
  })
})
