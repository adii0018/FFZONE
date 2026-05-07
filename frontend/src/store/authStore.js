/**
 * FFZone – Auth Store (Zustand)
 * Manages: user object, tokens, login/logout actions.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:          null,
      access_token:  null,
      refresh_token: null,
      isLoading:     false,

      // ── Login ──────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/login/', { email, password })
        localStorage.setItem('access_token',  data.access)
        localStorage.setItem('refresh_token', data.refresh)
        set({
          user:          data.user,
          access_token:  data.access,
          refresh_token: data.refresh,
          isLoading:     false,
        })
        return data
      },

      // ── Logout ─────────────────────────────────────────
      logout: async () => {
        try {
          const refresh = get().refresh_token
          if (refresh) await api.post('/auth/logout/', { refresh })
        } catch (_) { /* ignore errors, always clear local */ }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, access_token: null, refresh_token: null })
      },

      // ── Update user fields ─────────────────────────────
      setUser: (user) => set({ user }),

      // ── Helpers ────────────────────────────────────────
      isAuthenticated: () => !!get().access_token,
      isAdmin: () => get().user?.is_admin === true,
    }),
    {
      name: 'ffzone-auth',
      partialize: (state) => ({
        user:          state.user,
        access_token:  state.access_token,
        refresh_token: state.refresh_token,
      }),
    }
  )
)

export default useAuthStore
