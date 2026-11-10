import { ActiveStoreContext } from './activeStoreContext'

export function ActiveStoreProvider({ value, children }) {
  return <ActiveStoreContext.Provider value={value}>{children}</ActiveStoreContext.Provider>
}
