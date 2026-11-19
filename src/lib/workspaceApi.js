import { ApiError, apiFetch, readJsonSafe, toApiError } from './api.js'

/**
 * PUT /api/v1/workspaces/{id}
 * @param {string} workspaceId
 * @param {{ name: string }} payload
 */
export async function updateWorkspace(workspaceId, payload, deps = {}) {
  if (!workspaceId) {
    throw new ApiError('A workspace is required.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payload.name }),
    },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to update the workspace.')
  }

  const json = await readJsonSafe(response)
  const workspace = json?.data
  if (!workspace?.id) {
    throw new ApiError('Invalid workspace response.', { status: response.status, body: json })
  }
  return workspace
}

/**
 * GET /api/v1/workspaces/{id}/members
 */
export async function listWorkspaceMembers(workspaceId, deps = {}) {
  if (!workspaceId) {
    throw new ApiError('A workspace is required.', { status: 422 })
  }

  const response = await apiFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members`,
    { method: 'GET' },
    deps,
  )

  if (!response.ok) {
    throw await toApiError(response, 'Unable to load workspace members.')
  }

  const json = await readJsonSafe(response)
  const members = json?.data
  if (!Array.isArray(members)) {
    throw new ApiError('Invalid members response.', { status: response.status, body: json })
  }
  return members
}
