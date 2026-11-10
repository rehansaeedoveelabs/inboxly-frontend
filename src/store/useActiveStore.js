import { useContext } from 'react'
import { ActiveStoreContext } from './activeStoreContext'

export function useActiveStore() {
  return useContext(ActiveStoreContext)
}
