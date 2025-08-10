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
    try {
      console.log('Attempting login for:', credentials.email)
      
      // Backend expects form data with username field, not email
      const formData = new FormData()
      formData.append('username', credentials.email)
      formData.append('password', credentials.password)
      
      console.log('Sending login request...')
      const response = await api.post('/api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      // Backend returns access_token, frontend expects token
      const data = response.data
      const token = data.access_token
      console.log('Login successful, token received')
      
      // Store token for axios interceptor
      localStorage.setItem('token', token)
      
      // Fetch full user data using the token
      console.log('Fetching user data...')
      const userResponse = await api.get('/api/v1/auth/users/me')
      console.log('User data fetched successfully')
      
      return {
        token,
        user: userResponse.data,
      }
    } catch (error) {
      console.error('Login failed:', error)
      // Clean up token if login fails
      localStorage.removeItem('token')
      throw error
    }
  },
  
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData)
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('token')
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/users/me')
    return response.data
  },
}

export const leads = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/v1/leads', { params })
    return response.data
  },
  getStats: async () => {
    const response = await api.get('/api/v1/leads/stats')
    return response.data
  },
  getById: async (id) => {
    const response = await api.get(`/api/v1/leads/${id}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/api/v1/leads', data)
    return response.data
  },
  qualify: async (data) => {
    const response = await api.post('/api/v1/leads/qualify', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.put(`/api/v1/leads/${id}`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/leads/${id}`)
    return response.data
  },
}

export default api 