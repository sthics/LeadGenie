import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@/services/api'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { token, user } = await auth.login(credentials)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { user, token }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to login',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        auth.logout()
        set({ user: null, token: null, isAuthenticated: false })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore 