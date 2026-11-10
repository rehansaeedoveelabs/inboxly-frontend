import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import { ThemeContext } from './context'
import {
  applyResolvedTheme,
  getSystemTheme,
  isValidThemePreference,
  readStoredThemePreference,
  resolveTheme,
  storeThemePreference,
} from './theme'

function subscribeSystemTheme(onStoreChange) {
  const media = window.matchMedia('(prefers-color-scheme: light)')
  const handler = () => onStoreChange()
  media.addEventListener('change', handler)
  return () => media.removeEventListener('change', handler)
}

function useSystemThemeSnapshot() {
  return useSyncExternalStore(subscribeSystemTheme, getSystemTheme, () => 'dark')
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => readStoredThemePreference())
  const systemTheme = useSystemThemeSnapshot()

  const resolved = useMemo(() => {
    if (!isValidThemePreference(preference)) return 'dark'
    return preference === 'system' ? systemTheme : preference
  }, [preference, systemTheme])

  useEffect(() => {
    applyResolvedTheme(resolved, preference)
  }, [resolved, preference])

  const setPreference = useCallback((next) => {
    const value = isValidThemePreference(next) ? next : 'dark'
    setPreferenceState(value)
    storeThemePreference(value)
    applyResolvedTheme(resolveTheme(value), value)
  }, [])

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
