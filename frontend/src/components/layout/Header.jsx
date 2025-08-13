import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import useAuthStore from '../../stores/auth'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <button
          type="button"
          className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button
              type="button"
              className="rounded-full bg-background p-1 text-foreground hover:text-primary"
              onClick={toggleTheme}
            >
              <span className="sr-only">Toggle theme</span>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {/* User menu and logout */}
            <div className="flex items-center gap-x-2">
              <span className="text-sm text-muted-foreground">
                {user?.email || 'User'}
              </span>
              <button
                type="button"
                className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-foreground"
              >
                <span className="sr-only">Open user menu</span>
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-foreground hover:text-destructive transition-colors"
                title="Logout"
              >
                <span className="sr-only">Logout</span>
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0, x: isMobileMenuOpen ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="-m-1.5 p-1.5">
              <span className="sr-only">LeadGenie</span>
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="LeadGenie"
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  to="/dashboard"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/submit"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-50"
                >
                  Submit Lead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  )
}

export default Header 