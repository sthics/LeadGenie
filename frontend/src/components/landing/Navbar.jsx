import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <img
              src="/logo.svg"
              alt="LeadGenie"
              className="h-8 w-8"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <span className="text-xl font-bold text-foreground">
              LeadGenie
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
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