import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize auth state from localStorage
      initialize: async () => {
        set({ isLoading: true })
        const token = localStorage.getItem('token')
        if (token) {
          try {
            // Verify token is still valid by fetching current user
            const user = await auth.getCurrentUser()
            set({ user, token, isAuthenticated: true, isLoading: false })
          } catch (error) {
            // Token is invalid, clear everything
            localStorage.removeItem('token')
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          }
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        }
      },

      login: async (credentials) => {
        // Prevent concurrent login attempts
        const currentState = get()
        if (currentState.isLoading) {
          return currentState.user ? { user: currentState.user, token: currentState.token } : null
        }
        
        set({ isLoading: true, error: null })
        
        try {
          const { token, user } = await auth.login(credentials)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { user, token }
        } catch (error) {
          console.error('Login error:', error)
          set({
            error: error.response?.data?.detail || error.message || 'Failed to login',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const user = await auth.register(userData)
          set({ isLoading: false })
          return user
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Failed to register',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('token')
        // Clear auth state
        set({ user: null, token: null, isAuthenticated: false, error: null })
        // Redirect to landing page after logout
        window.location.href = '/'
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