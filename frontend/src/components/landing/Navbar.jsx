import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-brand-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <img
              src="/logoupdated.png"
              alt="LeadGenie"
              className="h-8 w-8"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="text-xl font-bold text-text-dark-primary dark:text-text-light-primary">
              LeadGenie
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-text-dark-secondary dark:text-text-light-secondary hover:text-text-dark-primary dark:hover:text-text-light-primary px-3 py-2 text-sm font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-brand-purple text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-purple-dark transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar