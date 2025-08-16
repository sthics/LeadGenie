import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Target, TrendingDown } from 'lucide-react'

const Problem = () => {
  const problems = [
    {
      icon: Clock,
      title: "Hours Wasted on Cold Leads",
      description: "Your team spends countless hours chasing leads that will never convert."
    },
    {
      icon: TrendingDown,
      title: "Missing Hot Opportunities",
      description: "High-value prospects slip through the cracks while you focus on low-priority leads."
    },
    {
      icon: Target,
      title: "No Clear Prioritization",
      description: "Without proper scoring, every lead feels equally important (and overwhelming)."
    }
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Tired of Sifting Through{' '}
            <span className="text-destructive">Hundreds of Leads?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            You're not alone. Sales and marketing teams waste 70% of their time on leads that never convert.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-background rounded-lg shadow-sm border-2 border-l-4 border-l-red-500 border-r-4 border-r-orange-500 border-t-red-300 border-b-orange-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg mb-4">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Problem