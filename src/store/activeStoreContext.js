import { createContext } from 'react'

export const ActiveStoreContext = createContext({
  workspace: null,
  stores: [],
  activeStoreId: null,
  activeStore: null,
  status: 'loading',
  error: '',
  refreshStores: async () => {},
  createStore: async () => null,
  selectStore: async () => {},
})
