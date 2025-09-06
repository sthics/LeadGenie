import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  DollarSign,
  Clock,
  Target,
  User,
  Building,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { leads } from '../services/api'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
})

// Keywords for live analysis
const BUYING_SIGNALS = {
  budget: ['budget', '$', 'cost', 'price', 'investment', 'funding', 'money', 'dollars'],
  urgency: ['asap', 'urgent', 'immediately', 'now', 'quickly', 'deadline', 'rush'],
  authority: ['decision', 'approve', 'authorize', 'ceo', 'manager', 'director', 'owner'],
  pain: ['problem', 'issue', 'failing', 'broken', 'struggling', 'challenge', 'need'],
  timeline: ['timeline', 'when', 'schedule', 'date', 'month', 'week', 'quarter']
}

const RISK_FACTORS = {
  competition: ['competitor', 'other', 'comparing', 'alternatives', 'options'],
  vague: ['maybe', 'might', 'possibly', 'thinking', 'considering', 'exploring'],
  budget_issues: ['cheap', 'free', 'no budget', 'tight budget', 'limited funds']
}

const LiveAnalysisPanel = ({ message, detectedSignals, detectedRisks }) => {
  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-brand-purple" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Live AI Analysis</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Watch as our AI analyzes your lead in real-time
        </p>
      </div>

      {/* What AI Looks For Guide */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          What the AI Looks For
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <TrendingUp className="h-3 w-3" />
            <span><strong>Buying Signals:</strong> Budget, timeline, urgency, and pain points</span>
          </div>
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <AlertTriangle className="h-3 w-3" />
            <span><strong>Risk Factors:</strong> Competition mentions, vague language, budget concerns</span>
          </div>
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Target className="h-3 w-3" />
            <span><strong>Tip:</strong> Include as much detail as possible for better scoring</span>
          </div>
        </div>
      </div>

      {/* Live Detection Results */}
      <div className="space-y-4">
        {/* Buying Signals */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Buying Signals Detected ({detectedSignals.length})
          </h4>
          {detectedSignals.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {detectedSignals.map((signal, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block px-2 py-1 text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full font-medium"
                >
                  {signal}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-700 dark:text-green-300 italic">
              Type your message to see buying signals detected...
            </p>
          )}
        </div>

        {/* Risk Factors */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Risk Factors Detected ({detectedRisks.length})
          </h4>
          {detectedRisks.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {detectedRisks.map((risk, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block px-2 py-1 text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full font-medium"
                >
                  {risk}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-orange-700 dark:text-orange-300 italic">
              No risk factors detected - great!
            </p>
          )}
        </div>

        {/* AI Score Preview */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Preliminary Score Preview
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                className="h-3 bg-gradient-to-r from-brand-purple to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ 
                  width: `${Math.min(85, 30 + (detectedSignals.length * 15) - (detectedRisks.length * 10))}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {Math.min(85, 30 + (detectedSignals.length * 15) - (detectedRisks.length * 10))}%
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Submit for full AI analysis and detailed scoring
          </p>
        </div>
      </div>
    </div>
  )
}

const LeadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedSignals, setDetectedSignals] = useState([])
  const [detectedRisks, setDetectedRisks] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
      budget: '',
      timeline: '',
    },
  })

  const watchedMessage = watch('message')

  // Live analysis of message content
  useEffect(() => {
    if (!watchedMessage) {
      setDetectedSignals([])
      setDetectedRisks([])
      return
    }

    const message = watchedMessage.toLowerCase()
    const signals = []
    const risks = []

    // Detect buying signals
    Object.entries(BUYING_SIGNALS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (message.includes(keyword.toLowerCase()) && !signals.includes(category)) {
          signals.push(category.charAt(0).toUpperCase() + category.slice(1))
        }
      })
    })

    // Detect risk factors  
    Object.entries(RISK_FACTORS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (message.includes(keyword.toLowerCase()) && !risks.includes(category)) {
          risks.push(category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1))
        }
      })
    })

    setDetectedSignals(signals)
    setDetectedRisks(risks)
  }, [watchedMessage])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const leadData = {
        name: data.name,
        email: data.email,
        company: data.company || 'Not specified',
        message: data.message,
        // Add budget and timeline to message for AI processing
        ...(data.budget || data.timeline ? {
          message: `${data.message}${data.budget ? ` Budget: ${data.budget}.` : ''}${data.timeline ? ` Timeline: ${data.timeline}.` : ''}`
        } : {})
      }
      
      const result = await leads.qualify(leadData)
      toast.success('Lead submitted successfully! AI analysis complete.')
      
      // Reset form
      window.location.reload()
      
      console.log('Lead qualified:', result)
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit lead. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Submit Your Lead for AI Analysis
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Watch our AI analyze and score your lead in real-time
          </motion.p>
        </div>

        {/* Two-Column Layout */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Left Column - Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Structured Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-purple" />
                  Structured Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        {...register('name')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="John Smith"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="john@company.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Company Field */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="company"
                        {...register('company')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Acme Corporation"
                      />
                    </div>
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Unstructured Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-purple" />
                  Unstructured Information
                </h3>
                
                {/* Main Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lead Message or Description
                  </label>
                  <textarea
                    id="message"
                    {...register('message')}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Paste the lead's email body or describe the interaction here. Include details like budget, timeline, needs, pain points, and any other relevant information. The more detail you provide, the more accurate the AI analysis will be..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
                  )}
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Budget Range (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        id="budget"
                        {...register('budget')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select budget range</option>
                        <option value="< $10k">Less than $10,000</option>
                        <option value="$10k - $50k">$10,000 - $50,000</option>
                        <option value="$50k - $100k">$50,000 - $100,000</option>
                        <option value="> $100k">More than $100,000</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeline (Optional)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        id="timeline"
                        {...register('timeline')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select timeline</option>
                        <option value="Immediate">Immediate (ASAP)</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6+ months">6+ months</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white font-medium transition-all duration-200 ${
                    isSubmitting || !isValid
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-brand-purple hover:bg-brand-purple-dark shadow-lg hover:shadow-xl'
                  }`}
                  whileHover={!isSubmitting && isValid ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting && isValid ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Analyzing Lead...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze and Score Lead
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Right Column - Live Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <LiveAnalysisPanel 
              message={watchedMessage}
              detectedSignals={detectedSignals}
              detectedRisks={detectedRisks}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LeadForm