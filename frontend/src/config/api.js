import axios from 'axios'
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
            refresh_token: refreshToken,
          })

          const { token } = response.data
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// API methods
export const apiService = {
  // Auth methods
  auth: {
    login: async (credentials) => {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
      return response.data
    },
    logout: async () => {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT)
      return response.data
    },
    refresh: async (refreshToken) => {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      })
      return response.data
    },
  },

  // Lead methods
  leads: {
    getAll: async (params) => {
      const response = await api.get(API_ENDPOINTS.LEADS.BASE, { params })
      return response.data
    },
    getById: async (id) => {
      const response = await api.get(API_ENDPOINTS.LEADS.BY_ID(id))
      return response.data
    },
    create: async (data) => {
      const response = await api.post(API_ENDPOINTS.LEADS.BASE, data)
      return response.data
    },
    update: async (id, data) => {
      const response = await api.put(API_ENDPOINTS.LEADS.BY_ID(id), data)
      return response.data
    },
    delete: async (id) => {
      const response = await api.delete(API_ENDPOINTS.LEADS.BY_ID(id))
      return response.data
    },
    getScore: async (id) => {
      const response = await api.get(API_ENDPOINTS.LEADS.SCORE(id))
      return response.data
    },
  },
}

export default apiService 