"use client";

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { 
  Download, 
  Video, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle, 
  Globe, 
  Wifi, 
  ArrowRight, 
  Shield,
  Clock,
  Smartphone,
  Cloud,
} from "lucide-react"
import Link from "next/link"
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

export default function FeaturesPage() {
  const features = [
    {
      icon: Download,
      title: "Offline Learning",
      description: "Download entire courses and study without internet connection. Perfect for areas with limited connectivity.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Video,
      title: "High-Quality Video Lessons",
      description: "Optimized video content for low bandwidth with progress tracking and anti-skip controls.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Group Learning",
      description: "Join learning groups, collaborate with peers, and track progress together with your community.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Award,
      title: "Verified Certificates",
      description: "Earn PDF certificates with QR codes upon completion. Verify authenticity anytime, anywhere.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: BookOpen,
      title: "Interactive Quizzes",
      description: "Test your knowledge with auto-graded quizzes. Get instant feedback and track your progress.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Learn in your preferred language. Currently supporting English and Nepali with more coming soon.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: CheckCircle,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and completion tracking for every course.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Wifi,
      title: "Auto Sync",
      description: "Automatically sync your progress when connected. Never lose your learning data.",
      color: "from-cyan-500 to-cyan-600"
    }
  ]

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Data Security",
      description: "Your learning data is encrypted and securely stored. Privacy-first approach to education.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Learn at your own pace with no time restrictions. Pause and resume courses anytime.",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Responsive design that works perfectly on all devices - phones, tablets, and computers.",
      color: "from-rose-500 to-rose-600"
    },
    {
      icon: Cloud,
      title: "Cloud Backup",
      description: "Automatic backup of your progress to the cloud when internet is available.",
      color: "from-sky-500 to-sky-600"
    }
  ]

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
                  Powerful Features for Modern Learning
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Discover all the tools and capabilities that make GyanPath the perfect choice for offline education in rural communities.
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
                      <Download className="mr-2 w-5 h-5" />
                      Start Learning Today
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 px-8"
                    asChild
                  >
                    <Link href="#features">
                      <BookOpen className="mr-2 w-5 h-5" />
                      Explore Features
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Features Section - Alternating Layout */}
          <section className="py-16 md:py-24 relative overflow-hidden" id="features">
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
                  Everything You Need to Learn Offline
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Comprehensive features designed specifically for low-bandwidth environments and rural learning needs.
                </motion.p>
              </div>

              <div className="max-w-6xl mx-auto space-y-24">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <motion.div 
                      key={index} 
                      className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex-1">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} text-white shadow-xl`}>
                          <IconComponent className="w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                          {feature.description}
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                          Learn more
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-slate-200">
                            <div className="text-center p-8">
                              <IconComponent className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                              <h4 className="text-xl font-semibold text-slate-900">{feature.title}</h4>
                            </div>
                          </div>
                          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl opacity-30 blur-xl"></div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Additional Features Section - Horizontal Scrolling */}
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
                  More Powerful Features
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Additional tools to enhance your learning experience.
                </motion.p>
              </div>

              <div className="overflow-x-auto pb-8">
                <div className="flex gap-6 min-w-max">
                  {additionalFeatures.map((feature, index) => {
                    const IconComponent = feature.icon
                    return (
                      <motion.div 
                        key={index} 
                        className="flex-shrink-0 w-80 p-8 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                        <p className="text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </motion.div>
                    )
                  })}
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
                  Ready to Experience These Features?
                </motion.h2>
                <motion.p 
                  className="text-xl text-indigo-100 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Join thousands of learners who are already benefiting from our comprehensive offline learning platform.
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
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-transparent text-white border-2 border-white hover:bg-white/10 text-lg h-14 px-8 transition-all duration-300 transform hover:-translate-y-1 hover:border-white hover:shadow-lg"
                  >
                    <Link href="/learner/browse">
                      Browse Courses
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