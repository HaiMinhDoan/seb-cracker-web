import { create } from 'zustand'
import type { AuthResponse } from '../types'

interface AuthState {
  user: AuthResponse | null
  token: string | null
  setAuth: (user: AuthResponse) => void
  logout: () => void
  isAdmin: () => boolean
}

const stored = localStorage.getItem('user')

export const useAuthStore = create<AuthState>((set, get) => ({
  user: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('token'),

  setAuth: (user) => {
    localStorage.setItem('token', user.token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: user.token })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  isAdmin: () => get().user?.role === 'ADMIN',
}))
