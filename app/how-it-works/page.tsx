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
  ArrowDown,
  CheckCircle,
  Users,
  Video,
  MessageCircle,
  Smartphone,
  Wifi
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              className="max-w-4xl mx-auto text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">How GyanPath Works</h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Start learning in four simple steps. No credit card required, no complex setup - just download and learn.
              </p>
              <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                <Link href="/auth/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Steps to Get Started</h2>
              <p className="text-xl text-muted-foreground">
                Follow these four easy steps to begin your offline learning journey.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
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
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                      {/* Content */}
                      <div className={`space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold">
                            {step.step}
                          </div>
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold">{step.title}</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                        <ul className="space-y-3">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Visual */}
                      <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                        <motion.div 
                          className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 250, damping: 18 }}
                        >
                          <IconComponent className="w-32 h-32 text-primary" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Arrow connector (except for last step) */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-full transform -translate-x-1/2 hidden md:block">
                        <ArrowDown className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features for Different Users */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Everyone</h2>
              <p className="text-xl text-muted-foreground">
                Whether you're a learner, instructor, or community leader, GyanPath has tools designed for your needs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div 
                    key={index} 
                    className="p-8 rounded-2xl border bg-card group"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <IconComponent className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
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
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              className="max-w-4xl mx-auto text-center space-y-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Designed for Rural Connectivity</h2>
                <p className="text-xl text-muted-foreground">
                  Our technology is specifically optimized for low-bandwidth environments and intermittent internet access.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Mobile-First Design</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Optimized for smartphones and tablets, the primary devices used in rural areas.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Offline-First Architecture</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Core functionality works without internet, syncing when connection is available.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Efficient Downloads</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Compressed content and smart caching minimize data usage and storage requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Progress Persistence</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Learning progress is saved locally and synced automatically when online.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of learners across Nepal who are accessing quality education offline.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                  <Link href="/auth/signup">
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg h-14 px-8"
                >
                  <Link href="/learner/browse">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}