import React from 'react'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Problem from '../components/landing/Problem'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Footer from '../components/landing/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default LandingPage