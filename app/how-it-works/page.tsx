"use client";

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { 
  UserPlus,
  Download,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle,
  Users,
  Video,
  MessageCircle,
  Smartphone,
  Wifi,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

// Particle bubble component for background effects
const ParticleBubble = ({ 
  size, 
  position, 
  animationDelay,
  animationDuration
}: { 
  size: number; 
  position: { top: string; left: string }; 
  animationDelay: number;
  animationDuration: number;
}) => (
  <motion.div 
    className="absolute rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 opacity-30"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      top: position.top,
      left: position.left,
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: animationDuration,
      repeat: Infinity,
      delay: animationDelay,
      ease: "easeInOut"
    }}
  />
);

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: "Sign Up Free",
      description: "Create your free account in seconds. Choose your role as a learner, instructor, or group admin.",
      icon: UserPlus,
      details: [
        "No credit card required",
        "Email verification",
        "Choose your learning goals",
        "Set up your profile"
      ]
    },
    {
      step: 2,
      title: "Browse & Download",
      description: "Explore our course catalog and download content to your device for offline access.",
      icon: Download,
      details: [
        "Browse by category or skill level",
        "Preview course content",
        "Download videos, materials, and quizzes",
        "Manage your storage efficiently"
      ]
    },
    {
      step: 3,
      title: "Learn Offline",
      description: "Study at your own pace without needing internet connection. Progress is tracked locally.",
      icon: BookOpen,
      details: [
        "Watch videos without buffering",
        "Take interactive quizzes",
        "Access study materials",
        "Track your progress offline"
      ]
    },
    {
      step: 4,
      title: "Sync & Earn",
      description: "When connected, sync your progress and earn verified certificates upon completion.",
      icon: Award,
      details: [
        "Auto-sync when online",
        "Submit quiz results",
        "Get performance feedback",
        "Download PDF certificates"
      ]
    }
  ]

  const features = [
    {
      title: "For Learners",
      icon: Users,
      description: "Access quality education anywhere, anytime",
      benefits: [
        "Download courses for offline study",
        "Interactive video lessons",
        "Progress tracking and analytics",
        "Verified certificates",
        "Community discussions",
        "Mobile-optimized learning"
      ]
    },
    {
      title: "For Instructors", 
      icon: Video,
      description: "Create and share knowledge with rural communities",
      benefits: [
        "Easy course creation tools",
        "Video upload and optimization",
        "Quiz and assignment builder",
        "Student progress monitoring",
        "Revenue sharing program",
        "Analytics dashboard"
      ]
    },
    {
      title: "For Communities",
      icon: MessageCircle,
      description: "Build learning networks in your area",
      benefits: [
        "Group learning management",
        "Local content creation",
        "Offline resource sharing",
        "Progress tracking for groups",
        "Community challenges",
        "Local language support"
      ]
    }
  ]

  // FAQ data
  const faqs = [
    {
      question: "Do I need internet to use GyanPath?",
      answer: "You only need internet to download courses. Once downloaded, you can learn completely offline. When you reconnect, your progress automatically syncs."
    },
    {
      question: "How much storage do I need?",
      answer: "Courses typically require 50-200MB of storage each. You can download as many courses as your device storage allows."
    },
    {
      question: "Can I access my courses on multiple devices?",
      answer: "Yes, you can access your downloaded courses on any device where you've logged in with your account."
    },
    {
      question: "How do I get certificates?",
      answer: "Complete courses and pass quizzes to earn verified PDF certificates that you can download and share."
    }
  ];

  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [hoveredFaqIndex, setHoveredFaqIndex] = useState<number | null>(null);

  // Generate random particle bubbles
  const [particles, setParticles] = useState<Array<{
    id: number; 
    size: number; 
    position: { top: string; left: string }; 
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  useEffect(() => {
    // Create initial particles with more dynamic properties
    const initialParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 30) + 10,
      position: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`
      },
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 8 + 4 // Between 4-12 seconds
    }));
    setParticles(initialParticles);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-indigo-50 relative overflow-hidden">
      {/* Extended background gradient and particle bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        
        {/* Large decorative gradients */}
        <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
        
        {/* Particle bubbles */}
        {particles.map((particle) => (
          <ParticleBubble 
            key={particle.id}
            size={particle.size}
            position={particle.position}
            animationDelay={particle.animationDelay}
            animationDuration={particle.animationDuration}
          />
        ))}
      </div>

      <div className="relative z-10">
        <SiteHeader />

        <main className="flex-1">
          {/* Hero Section - Matching contact page style */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative elements for visual appeal */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 opacity-50 blur-3xl"></div>
              <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 opacity-50 blur-3xl"></div>
            </div>
            
            {/* Floating elements for depth */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-indigo-300 opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-purple-300 opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-indigo-400 opacity-25 animate-pulse delay-2000"></div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <motion.div 
                className="max-w-4xl mx-auto text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  How GyanPath Works
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Start learning in four simple steps. No credit card required, no complex setup - just download and learn.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="/auth/signup">
                      <UserPlus className="mr-2 w-5 h-5" />
                      Start Your Journey
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 px-8"
                    asChild
                  >
                    <Link href="#steps">
                      <BookOpen className="mr-2 w-5 h-5" />
                      See How It Works
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Steps Section */}
          <section className="py-16 md:py-24 relative overflow-hidden" id="steps">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-40 blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-40 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4 text-slate-900"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5 }}
                >
                  Simple Steps to Get Started
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Follow these four easy steps to begin your offline learning journey.
                </motion.p>
              </div>

              <div className="max-w-6xl mx-auto space-y-16">
                {steps.map((step, index) => {
                  const IconComponent = step.icon
                  return (
                    <motion.div 
                      key={index} 
                      className="relative"
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    >
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                              {step.step}
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-indigo-600" />
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-slate-900">{step.title}</h3>
                          <p className="text-lg text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                          <ul className="space-y-3">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <span className="text-slate-600">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Visual */}
                        <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                          <motion.div 
                            className="aspect-square max-w-md mx-auto bg-white rounded-3xl flex items-center justify-center border border-slate-200 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 250, damping: 18 }}
                          >
                            <IconComponent className="w-32 h-32 text-indigo-600" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Features for Different Users */}
          <section className="py-16 md:py-24 bg-white/70 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-30 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4 text-slate-900"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5 }}
                >
                  Built for Everyone
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Whether you're a learner, instructor, or community leader, GyanPath has tools designed for your needs.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <motion.div 
                      key={index} 
                      className="p-8 rounded-2xl border border-slate-200 bg-white/80 hover:shadow-xl transition-all duration-300 group backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all duration-300">
                        <IconComponent className="w-8 h-8 text-indigo-600 group-hover:text-white transition-all duration-300" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{feature.title}</h3>
                      <p className="text-slate-600 mb-6">{feature.description}</p>
                      <ul className="space-y-3">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600 text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-30 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <motion.div 
                className="max-w-4xl mx-auto text-center space-y-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Designed for Rural Connectivity</h2>
                  <p className="text-lg md:text-xl text-slate-600">
                    Our technology is specifically optimized for low-bandwidth environments and intermittent internet access.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 text-left">
                  <motion.div 
                    className="space-y-4 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-slate-900">Mobile-First Design</h3>
                    </div>
                    <p className="text-slate-600">
                      Optimized for smartphones and tablets, the primary devices used in rural areas.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="space-y-4 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center gap-3">
                      <Wifi className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-slate-900">Offline-First Architecture</h3>
                    </div>
                    <p className="text-slate-600">
                      Core functionality works without internet, syncing when connection is available.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="space-y-4 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-slate-900">Efficient Downloads</h3>
                    </div>
                    <p className="text-slate-600">
                      Compressed content and smart caching minimize data usage and storage requirements.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="space-y-4 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-slate-900">Progress Persistence</h3>
                    </div>
                    <p className="text-slate-600">
                      Learning progress is saved locally and synced automatically when online.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section - Enhanced with hover effect to show answers */}
          <section className="py-16 md:py-24 bg-white/70 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-40 blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/3 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-40 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold mb-4 text-slate-900"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    Frequently Asked Questions
                  </motion.h2>
                  <motion.p 
                    className="text-lg md:text-xl text-slate-600"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Quick answers to common questions about how GyanPath works.
                  </motion.p>
                </div>

                <div className="space-y-5">
                  {faqs.map((faq, index) => (
                    <motion.div 
                      key={index} 
                      className="p-6 rounded-xl border border-slate-200 bg-white/80 hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      onMouseEnter={() => setHoveredFaqIndex(index)}
                      onMouseLeave={() => setHoveredFaqIndex(null)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">
                          {faq.question}
                        </h3>
                        <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-all duration-300 flex-shrink-0 ml-4 ${(openFaqIndex === index || hoveredFaqIndex === index) ? 'rotate-180' : ''}`} />
                      </div>
                      <motion.div
                        initial={false}
                        animate={{ 
                          height: (openFaqIndex === index || hoveredFaqIndex === index) ? "auto" : 0, 
                          opacity: (openFaqIndex === index || hoveredFaqIndex === index) ? 1 : 0 
                        }}
                        className="overflow-hidden"
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-slate-600 leading-relaxed mt-3">
                          {faq.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <p className="text-slate-600 mb-5">
                    Have more questions?
                  </p>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    asChild
                  >
                    <Link href="/contact">
                      Contact Us
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section - Matching contact page style */}
          <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 blur-3xl"></div>
            </div>
            
            {/* Additional floating particles for this section */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-white/20 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-5 h-5 rounded-full bg-white/10 animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-white/15 animate-pulse delay-2000"></div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5 }}
                >
                  Ready to Transform Your Learning?
                </motion.h2>
                <motion.p 
                  className="text-xl text-indigo-100 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Join thousands of learners across Nepal who are accessing quality education offline.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-white text-indigo-600 hover:bg-indigo-50 text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Link href="/auth/signup">
                      Get Started Now
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-transparent text-white border-2 border-white hover:bg-white/10 text-lg h-14 px-8 transition-all duration-300 transform hover:-translate-y-1 hover:border-white hover:shadow-lg"
                  >
                    <Link href="/learner/browse">
                      Explore Courses
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}