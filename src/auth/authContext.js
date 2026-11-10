import { createContext } from 'react'

export const AuthContext = createContext({
  status: 'loading',
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  isAuthenticated: false,
  isLoading: true,
})
