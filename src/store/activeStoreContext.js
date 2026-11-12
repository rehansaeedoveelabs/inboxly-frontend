import { createContext } from 'react'

export const ActiveStoreContext = createContext({
  workspace: null,
  stores: [],
  activeStoreId: null,
  activeStore: null,
  status: 'loading',
  error: '',
  refreshStores: async () => ({ stores: [], ok: true }),
  createStore: async () => null,
  selectStore: async () => {},
})
