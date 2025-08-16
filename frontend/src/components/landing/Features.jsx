import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Target, Clock } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'Understand True Buying Intent',
      description: 'Our natural language processing identifies genuine purchase signals hidden in lead communications, giving you confidence in every conversation.'
    },
    {
      icon: Target,
      title: 'Focus Your Energy on Deals That Will Close',
      description: 'Advanced lead scoring eliminates guesswork, directing your team toward prospects most likely to convert into revenue.'
    },
    {
      icon: Clock,
      title: 'Save 10+ Hours Per Week',
      description: 'Automated filtering and prioritization eliminates manual lead qualification, freeing your team to focus on selling.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Supercharge Your Sales Pipeline
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform provides all the tools you need to qualify, score, 
            and prioritize leads automatically.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-background p-8 rounded-2xl shadow-sm border-2 border-l-4 border-l-purple-500 border-r-4 border-r-blue-500 border-t-purple-300 border-b-blue-300 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features