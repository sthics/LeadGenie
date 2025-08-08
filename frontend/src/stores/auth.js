import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@/services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize auth state from localStorage
      initialize: () => {
        const token = localStorage.getItem('token')
        if (token) {
          const state = get()
          if (state.user && state.token) {
            set({ isAuthenticated: true })
          }
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        
        // Demo mode - bypass authentication for demo credentials
        if (credentials.email === 'demo@leadgenie.com' && credentials.password === 'demo123') {
          const demoUser = {
            id: 'demo-user-id',
            email: 'demo@leadgenie.com',
            full_name: 'Demo User',
            role: 'admin'
          }
          const demoToken = 'demo-token-' + Date.now()
          
          // Store in localStorage for persistence
          localStorage.setItem('token', demoToken)
          
          set({ 
            user: demoUser, 
            token: demoToken, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          return { user: demoUser, token: demoToken }
        }
        
        // Regular authentication flow
        try {
          const { token, user } = await auth.login(credentials)
          set({ user, token, isAuthenticated: true, isLoading: false })
          return { user, token }
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Failed to login',
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
        auth.logout()
        set({ user: null, token: null, isAuthenticated: false })
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