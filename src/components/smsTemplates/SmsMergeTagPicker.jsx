import { SMS_MERGE_TAG_GROUPS, smsMergeTagToken } from '../../lib/smsTemplateCatalog'

/**
 * Categorized merge-tag chips for the SMS template editor.
 */
export function SmsMergeTagPicker({ onInsert }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ink">Insert a merge tag</p>
      <div className="space-y-3">
        {SMS_MERGE_TAG_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const token = smsMergeTagToken(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    title={`Insert ${token}`}
                    onClick={() => onInsert?.(token)}
                    className="rounded-md border border-line bg-midnight px-2 py-1 font-mono text-[11px] text-ink transition hover:border-electric/50 hover:bg-electric/10"
                  >
                    {token}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
