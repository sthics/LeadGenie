import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  logout: () => {
    localStorage.removeItem('token')
  },
}

export const leads = {
  getAll: async (params) => {
    const response = await api.get('/leads', { params })
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/leads', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/leads/${id}`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  },
}

export default api 