import { createContext } from 'react'

export const ActiveStoreContext = createContext({
  stores: [],
  activeStoreId: null,
  activeStore: null,
  setActiveStoreId: () => {},
})
