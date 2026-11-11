import { ActiveStoreContext } from './activeStoreContext'

/** Thin provider for tests or custom store values. Prefer WorkspaceStoresProvider in the app. */
export function ActiveStoreProvider({ value, children }) {
  return <ActiveStoreContext.Provider value={value}>{children}</ActiveStoreContext.Provider>
}
