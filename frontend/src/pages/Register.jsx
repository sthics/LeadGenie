import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, User, Building } from 'lucide-react'
import useAuthStore from '../stores/auth'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['sales_rep', 'sales_manager'], {
    errorMap: () => ({ message: 'Please select a role' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isLoading, error, isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      role: 'sales_rep',
    },
  })

  const onSubmit = async (data) => {
    if (isLoading) {
      console.log('Registration already in progress, ignoring submission')
      return
    }
    
    try {
      console.log('Submitting registration form')
      // Remove confirmPassword from data before sending to API
      const { confirmPassword, ...registrationData } = data
      const result = await registerUser(registrationData)
      
      if (result) {
        toast.success('Registration successful! Please login with your credentials.')
        navigate('/login')
      }
    } catch (error) {
      console.error('Registration submission error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-center p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <img
            src="/logoupdated.png"
            alt="LeadGenie"
            className="h-12 w-12 mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">
            Join LeadGenie
          </h1>
          <p className="text-lg text-white/80 mb-6">
            Start qualifying leads with AI-powered intelligence and transform your sales process today.
          </p>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>AI-powered lead qualification</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>80% reduction in qualification time</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>20% increase in conversion rates</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Right side - Registration form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <img
              src="/logoupdated.png"
              alt="LeadGenie"
              className="h-12 w-12 mx-auto mb-4 lg:hidden"
            />
            <h2 className="text-2xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="full_name"
                  type="text"
                  {...register('full_name')}
                  className="block w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="block w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-foreground"
              >
                Role
              </label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="role"
                  {...register('role')}
                  className="block w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="sales_rep">Sales Representative</option>
                  <option value="sales_manager">Sales Manager</option>
                </select>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="block w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="block w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Register