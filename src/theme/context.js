import { createContext } from 'react'

export const ThemeContext = createContext({
  preference: 'dark',
  resolved: 'dark',
  setPreference: () => {},
})
