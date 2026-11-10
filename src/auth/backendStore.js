/**
 * Inspect UserResource workspaces for a known backend store ULID.
 * Never treats mock dashboard store ids as real.
 *
 * @param {{ workspaces?: Array<{ active_store_id?: string | null }> } | null | undefined} user
 * @returns {string | null}
 */
export function findActiveBackendStoreId(user) {
  const workspaces = user?.workspaces
  if (!Array.isArray(workspaces)) return null

  for (const workspace of workspaces) {
    if (workspace?.active_store_id) {
      return String(workspace.active_store_id)
    }
  }

  return null
}

/**
 * @param {{ workspaces?: unknown } | null | undefined} user
 */
export function userHasWorkspace(user) {
  return Array.isArray(user?.workspaces) && user.workspaces.length > 0
}
