import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon, Menu, X } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
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
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <Menu size={20} />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-brand-dark border-l border-gray-200 dark:border-gray-700 px-6 py-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => {
                  navigate('/')
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
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
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
              >
                <X size={20} />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  navigate('/login')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-left block px-4 py-3 text-lg font-medium text-text-dark-secondary dark:text-text-light-secondary hover:text-text-dark-primary dark:hover:text-text-light-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate('/register')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full bg-brand-purple text-white px-4 py-3 rounded-lg text-lg font-medium hover:bg-brand-purple-dark transition-colors"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.nav>
  )
}

export default Navbar