"use client";

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { 
  Heart,
  Users,
  Globe,
  Target,
  ArrowRight,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Calendar,
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

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Accessibility First",
      description: "We believe education should be accessible to everyone, regardless of location or internet connectivity."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our platform is built by the community, for the community, with local needs at the forefront."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Starting in Nepal, we aim to bridge the digital education divide across rural communities worldwide."
    },
    {
      icon: Target,
      title: "Quality Focus",
      description: "We maintain high standards for content quality while making it accessible to diverse learning needs."
    }
  ]

  const stats = [
    {
      number: "10,000+",
      label: "Active Learners",
      description: "Students from rural communities"
    },
    {
      number: "500+",
      label: "Courses Available", 
      description: "Across multiple subjects"
    },
    {
      number: "95%",
      label: "Completion Rate",
      description: "Industry-leading engagement"
    },
    {
      number: "50+",
      label: "Districts Covered",
      description: "Across Nepal and growing"
    }
  ]

  const milestones = [
    {
      icon: Lightbulb,
      year: "2022",
      title: "The Beginning",
      description: "Founded by educators who witnessed firsthand the challenges of delivering quality education to remote areas in Nepal."
    },
    {
      icon: BookOpen,
      year: "2023",
      title: "First Launch",
      description: "Launched our pilot program in 10 districts across Nepal with overwhelming community response."
    },
    {
      icon: TrendingUp,
      year: "2024",
      title: "Rapid Growth",
      description: "Expanded to 50+ districts with over 10,000 active learners and multilingual support."
    },
    {
      icon: Globe,
      year: "Now",
      title: "Global Vision",
      description: "Preparing to expand beyond Nepal to serve rural communities worldwide."
    }
  ]

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Former educator with 15+ years in rural education development.",
      initials: "RK"
    },
    {
      name: "Sita Sharma", 
      role: "Chief Technology Officer",
      bio: "Tech innovator specializing in offline-first applications.",
      initials: "SS"
    },
    {
      name: "Anil Thapa",
      role: "Head of Content",
      bio: "Curriculum designer focused on culturally relevant education.",
      initials: "AT"
    },
    {
      name: "Maya Gurung",
      role: "Community Manager", 
      bio: "Rural development expert connecting communities nationwide.",
      initials: "MG"
    }
  ]

  // FAQ data for additional section
  const faqs = [
    {
      question: "How does GyanPath work offline?",
      answer: "Our platform allows you to download entire courses when you have internet access. Once downloaded, you can study without any internet connection. Your progress is saved locally and synced when you're back online."
    },
    {
      question: "Is GyanPath really free?",
      answer: "Yes! GyanPath is completely free for learners. We believe education should be accessible to everyone, regardless of economic status."
    },
    {
      question: "What devices are supported?",
      answer: "GyanPath works on smartphones, tablets, and computers. Our platform is optimized for mobile devices, which are most commonly used in rural areas."
    },
    {
      question: "Can I become an instructor?",
      answer: "Absolutely! We welcome educators who want to share their knowledge. You can sign up as an instructor and start creating courses that reach learners in remote areas."
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
                  About GyanPath
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Empowering rural communities through accessible, offline-first education. Learn our story and mission.
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
                    <Link href="#mission">
                      <Target className="mr-2 w-5 h-5" />
                      Our Mission
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 px-8"
                    asChild
                  >
                    <Link href="#team">
                      <Users className="mr-2 w-5 h-5" />
                      Meet Our Team
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 md:py-24 relative overflow-hidden" id="mission">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-40 blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-40 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Our Mission</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      GyanPath was born from a simple belief: geography should never limit access to quality education. 
                      We're on a mission to democratize learning by making high-quality educational content accessible 
                      to rural communities, even without reliable internet connectivity.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Our platform is specifically designed for the unique challenges faced by learners in remote areas - 
                      limited bandwidth, intermittent connectivity, and diverse local needs. We're not just building 
                      another learning platform; we're crafting a solution that truly serves underserved communities.
                    </p>
                    <div className="pt-4">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        asChild
                      >
                        <Link href="/auth/signup">
                          Join Our Mission
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Core Values</h3>
                    <div className="space-y-6">
                      {values.map((value, index) => {
                        const IconComponent = value.icon
                        return (
                          <motion.div 
                            key={index} 
                            className="flex gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-all duration-300 hover:border-indigo-300"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          >
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-indigo-600">
                              <IconComponent className="w-6 h-6 text-indigo-600 transition-all duration-300 group-hover:text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-slate-900 transition-colors duration-300">{value.title}</h4>
                              <p className="text-slate-600">{value.description}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* Stats Section */}
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
                  Our Impact
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  These numbers represent real lives transformed through accessible education.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="p-6 rounded-2xl border border-slate-200 bg-white/80 hover:shadow-xl transition-all duration-300 text-center group backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                      {stat.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{stat.label}</h3>
                    <p className="text-slate-600">{stat.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Journey Section */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-30 blur-3xl"></div>
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
                    Our Journey
                  </motion.h2>
                  <motion.p 
                    className="text-lg md:text-xl text-slate-600"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Key milestones in our mission to democratize education.
                  </motion.p>
                </div>

                <div className="space-y-8">
                  {milestones.map((milestone, index) => {
                    const IconComponent = milestone.icon
                    return (
                      <motion.div 
                        key={index} 
                        className="flex gap-6 p-6 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-all duration-300">
                          <IconComponent className="w-8 h-8 text-indigo-600 group-hover:text-white transition-all duration-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-4 mb-2">
                            <span className="inline-flex items-center gap-2 text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                              <Calendar className="w-4 h-4" />
                              {milestone.year}
                            </span>
                            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{milestone.title}</h3>
                          </div>
                          <p className="text-slate-600 group-hover:text-slate-700 transition-colors duration-300">{milestone.description}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16 md:py-24 bg-slate-50/70 backdrop-blur-sm relative overflow-hidden" id="team">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
              <div className="absolute bottom-1/4 -right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-30 blur-3xl"></div>
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
                  Our Team
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Meet the passionate individuals working to make education accessible to all.
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.map((member, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center space-y-4 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 mx-auto group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300">
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{member.name}</h3>
                      <p className="text-indigo-600 font-medium mb-2 group-hover:text-indigo-800 transition-colors duration-300">{member.role}</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
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
                    Quick answers to common questions about GyanPath.
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
                    Don't see your question here?
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
                  Join Us in Transforming Education
                </motion.h2>
                <motion.p 
                  className="text-xl text-indigo-100 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Whether you're a learner, educator, or supporter of accessible education, 
                  there's a place for you in the GyanPath community.
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
                      Start Learning Free
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-transparent text-white border-2 border-white hover:bg-white/10 text-lg h-14 px-8 transition-all duration-300 transform hover:-translate-y-1 hover:border-white hover:shadow-lg"
                  >
                    <Link href="/contact">
                      Contact Us
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