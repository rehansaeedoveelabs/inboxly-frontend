/** Inboxly design tokens — semantic surfaces shared by light and dark themes. */

export const brand = {
  electric: '#2878FF',
  cantaloupe: '#FFA66B',
}

/** Preserved existing dark palette. */
export const darkColors = {
  page: '#10131C',
  elevated: '#191E2B',
  secondary: '#252C3B',
  ink: '#F3F5FA',
  muted: '#A4ADBF',
  line: '#2E3648',
  danger: '#F07178',
  success: '#3DDC97',
  warning: '#F0C14D',
  electric: brand.electric,
  cantaloupe: brand.cantaloupe,
  cantaloupeInk: brand.cantaloupe,
}

/** Premium light SaaS palette — brand fills unchanged; ink darkened for text. */
export const lightColors = {
  page: '#F4F6FA',
  elevated: '#FFFFFF',
  secondary: '#E8ECF4',
  ink: '#12151F',
  muted: '#5C6578',
  line: '#D5DBE7',
  danger: '#D1434B',
  success: '#1F9A6A',
  warning: '#C48A12',
  electric: brand.electric,
  cantaloupe: brand.cantaloupe,
  cantaloupeInk: '#B85A1E',
}

/** @deprecated Prefer CSS variables / theme context. Kept for reference. */
export const colors = {
  midnight: darkColors.page,
  elevated: darkColors.elevated,
  secondary: darkColors.secondary,
  electric: brand.electric,
  cantaloupe: brand.cantaloupe,
  textPrimary: darkColors.ink,
  textSecondary: darkColors.muted,
  border: darkColors.line,
  danger: darkColors.danger,
  success: darkColors.success,
  warning: darkColors.warning,
}

export const spacing = {
  pageX: '1.5rem',
  pageY: '1.25rem',
  section: '1.25rem',
  card: '1rem',
}

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
}

export const typography = {
  fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
}

export const THEME_STORAGE_KEY = 'inboxly-theme'
export const THEME_OPTIONS = ['dark', 'light', 'system']
