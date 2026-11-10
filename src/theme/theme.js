import { THEME_OPTIONS, THEME_STORAGE_KEY } from './tokens'

export function isValidThemePreference(value) {
  return THEME_OPTIONS.includes(value)
}

export function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function resolveTheme(preference) {
  const pref = isValidThemePreference(preference) ? preference : 'dark'
  return pref === 'system' ? getSystemTheme() : pref
}

export function readStoredThemePreference() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isValidThemePreference(value) ? value : 'dark'
  } catch {
    return 'dark'
  }
}

export function storeThemePreference(preference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Ignore private-mode / blocked storage failures.
  }
}

export function applyResolvedTheme(resolved, preference) {
  const root = document.documentElement
  root.setAttribute('data-theme', resolved)
  root.setAttribute('data-theme-preference', preference)
  root.style.colorScheme = resolved
}

export function getCssVar(name, fallback = '') {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function getChartThemeColors() {
  return {
    grid: getCssVar('--inboxly-line', '#2E3648'),
    axis: getCssVar('--inboxly-muted', '#A4ADBF'),
    tooltipBg: getCssVar('--inboxly-elevated', '#191E2B'),
    tooltipBorder: getCssVar('--inboxly-line', '#2E3648'),
    tooltipText: getCssVar('--inboxly-ink', '#F3F5FA'),
    electric: getCssVar('--inboxly-electric', '#2878FF'),
    cantaloupe: getCssVar('--inboxly-cantaloupe', '#FFA66B'),
  }
}
