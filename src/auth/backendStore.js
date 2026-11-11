/**
 * First workspace from UserResource — never invents an ID.
 *
 * @param {{ workspaces?: Array<{ id?: string, active_store_id?: string | null }> } | null | undefined} user
 * @returns {{ id: string, active_store_id?: string | null, name?: string, permissions?: object } | null}
 */
export function getPrimaryWorkspace(user) {
  const workspaces = user?.workspaces
  if (!Array.isArray(workspaces) || workspaces.length === 0) return null
  const workspace = workspaces[0]
  if (!workspace?.id) return null
  return workspace
}

/**
 * Inspect UserResource workspaces for a known backend store ULID.
 * Never treats mock dashboard store ids as real.
 *
 * @param {{ workspaces?: Array<{ active_store_id?: string | null }> } | null | undefined} user
 * @returns {string | null}
 */
export function findActiveBackendStoreId(user) {
  const workspace = getPrimaryWorkspace(user)
  return workspace?.active_store_id ? String(workspace.active_store_id) : null
}

/**
 * @param {{ workspaces?: unknown } | null | undefined} user
 */
export function userHasWorkspace(user) {
  return Boolean(getPrimaryWorkspace(user))
}
