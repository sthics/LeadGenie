import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Check } from 'lucide-react'
import { leads } from '../services/api'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.string().optional(),
  timeline: z.enum(['immediate', '1-3 months', '3-6 months', '6+ months']).optional(),
})

const steps = [
  { id: 'contact', name: 'Contact Information' },
  { id: 'project', name: 'Project Details' },
  { id: 'review', name: 'Review & Submit' },
]

const LeadForm = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      company: '',
      description: '',
      budget: '',
      timeline: undefined,
    },
  })

  const formData = watch()

  const onSubmit = async (data) => {
    console.log('Form submitted - current step:', currentStep)
    
    // Only allow submission on the final step
    if (currentStep !== steps.length - 1) {
      console.log('Preventing submission - not on final step')
      return
    }
    
    setIsSubmitting(true)
    try {
      // Prepare data for API - map to backend expected format
      const leadData = {
        name: data.name,
        email: data.email,
        company: data.company || 'Not specified',
        message: data.description,
        // Add budget and timeline to message for AI processing
        ...(data.budget || data.timeline ? {
          message: `${data.description}${data.budget ? ` Budget: ${data.budget}.` : ''}${data.timeline ? ` Timeline: ${data.timeline}.` : ''}`
        } : {})
      }
      
      const result = await leads.qualify(leadData)
      toast.success('Lead submitted successfully! AI qualification in progress.')
      
      // Reset form
      setCurrentStep(0)
      // Reset doesn't work with controlled form, so we need to manually reset
      window.location.reload() // Simple reset for demo
      
      console.log('Lead qualified:', result)
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit lead. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    console.log('Next step clicked - current step:', currentStep)
    
    // Validate current step before proceeding
    let fieldsToValidate = []
    if (currentStep === 0) {
      fieldsToValidate = ['name', 'email', 'company']
    } else if (currentStep === 1) {
      fieldsToValidate = ['description']
    }
    
    const isStepValid = await trigger(fieldsToValidate)
    console.log('Step validation result:', isStepValid, 'Fields validated:', fieldsToValidate)
    
    if (isStepValid) {
      console.log('Moving to next step:', currentStep + 1)
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    } else {
      console.log('Validation failed, staying on current step')
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground">
                Company
              </label>
              <input
                type="text"
                id="company"
                {...register('company')}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Acme Inc."
              />
              {errors.company && (
                <p className="mt-1 text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Project Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Tell us about your project..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-foreground">
                Budget Range (Optional)
              </label>
              <select
                id="budget"
                {...register('budget')}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select a range</option>
                <option value="< 10k">Less than $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="> 100k">More than $100,000</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-foreground">
                Timeline (Optional)
              </label>
              <select
                id="timeline"
                {...register('timeline')}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select a timeline</option>
                <option value="immediate">Immediate</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {(Object.keys(errors).length > 0) && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <h4 className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-lg font-medium">Review Your Information</h3>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="mt-1 text-sm text-foreground">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm text-foreground">{formData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                  <dd className="mt-1 text-sm text-foreground">{formData.company}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="mt-1 text-sm text-foreground">{formData.description}</dd>
                </div>
                {formData.budget && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Budget</dt>
                    <dd className="mt-1 text-sm text-foreground">{formData.budget}</dd>
                  </div>
                )}
                {formData.timeline && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Timeline</dt>
                    <dd className="mt-1 text-sm text-foreground">{formData.timeline}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
            {steps.map((step, index) => (
              <li key={step.id} className="md:flex-1">
                <div
                  className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                    index <= currentStep
                      ? 'border-primary'
                      : 'border-muted'
                  }`}
                >
                  <span className="text-sm font-medium text-primary">
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="space-y-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        <div className="flex justify-between">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(onSubmit)()}
              disabled={isSubmitting || !isValid}
              className="ml-auto inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Submit
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadForm 