import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import useAuthStore from './stores/auth'

// Layout Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import Dashboard from './pages/Dashboard'
import LeadForm from './pages/LeadForm'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'

function App() {
  const { theme, setLightTheme, setDarkTheme } = useTheme()
  const { initialize } = useAuthStore()

  // Initialize authentication state once on mount
  useEffect(() => {
    const initAuth = async () => {
      await initialize()
    }
    initAuth()
  }, []) // Empty dependency array - run only once

  // Handle theme initialization and changes
  useEffect(() => {
    // Check system preference for dark mode
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      setDarkTheme()
    } else {
      setLightTheme()
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (e.matches) {
        setDarkTheme()
      } else {
        setLightTheme()
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setLightTheme, setDarkTheme])

  return (
    <Router>
      <div className={theme}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/submit" element={<LeadForm />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App 