"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Users,
  Building,
  Send,
  CheckCircle,
  Headphones,
  Globe,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

// Enhanced Particle bubble component with more dynamic animations
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

export default function ContactPage() {
  // State for form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State for FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [hoveredFaqIndex, setHoveredFaqIndex] = useState<number | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: ""
        });
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  // Contact methods data
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a message anytime",
      value: "support@gyanpath.com",
      link: "mailto:support@gyanpath.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Mon-Fri, 9 AM - 6 PM NPT",
      value: "+977-1-4567890",
      link: "tel:+97714567890"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our main office",
      value: "Kathmandu, Nepal",
      link: "#"
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "We typically respond within",
      value: "24 hours",
      link: "#"
    }
  ];

  // Support types data
  const supportTypes = [
    {
      icon: HelpCircle,
      title: "General Support",
      description: "Questions about using the platform, account issues, or technical problems."
    },
    {
      icon: Users,
      title: "Partnership Inquiries", 
      description: "Interested in partnering with us or bringing GyanPath to your community."
    },
    {
      icon: Building,
      title: "Institutional Support",
      description: "Schools, NGOs, and organizations looking to implement GyanPath."
    },
    {
      icon: MessageCircle,
      title: "Feedback & Suggestions",
      description: "Help us improve by sharing your ideas and experiences."
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does offline learning work?",
      answer: "You can download entire courses to your device when you have internet access. Once downloaded, you can study without any internet connection. Your progress is saved locally and synced when you're back online."
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

  // Generate random particle bubbles with more variation
  const [particles, setParticles] = useState<Array<{
    id: number; 
    size: number; 
    position: { top: string; left: string }; 
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  useEffect(() => {
    // Create initial particles with more dynamic properties
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
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
          {/* Hero Section - Improved with sleek professional design */}
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
                  Get in Touch
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Have questions? Need support? Want to partner with us? We'd love to hear from you.
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
                    <Link href="#contact-form">
                      <Mail className="mr-2 w-5 h-5" />
                      Send Message
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 px-8"
                    asChild
                  >
                    <Link href="#faq">
                      <HelpCircle className="mr-2 w-5 h-5" />
                      View FAQs
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Contact Methods */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-40 blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/3 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-40 blur-3xl"></div>
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
                  How to Reach Us
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Choose the method that works best for you. We're here to help!
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {contactMethods.map((method, index) => {
                  const IconComponent = method.icon
                  return (
                    <motion.div 
                      key={index} 
                      className="p-6 rounded-2xl border border-slate-200 bg-white/80 hover:shadow-xl transition-all duration-300 text-center group backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-slate-900">{method.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{method.description}</p>
                      {method.link !== "#" ? (
                        <a 
                          href={method.link} 
                          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-300"
                        >
                          {method.value}
                        </a>
                      ) : (
                        <p className="text-indigo-600 font-medium">{method.value}</p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Contact Form & Support Types */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-30 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 backdrop-blur-sm" id="contact-form">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900">Send Us a Message</h2>
                    <p className="text-slate-600 mb-8">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>

                    {isSubmitted ? (
                      <motion.div 
                        className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                        <p className="text-green-700">
                          Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                      </motion.div>
                    ) : (
                      <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-700">First Name</Label>
                            <Input 
                              id="firstName" 
                              placeholder="Your first name" 
                              value={formData.firstName}
                              onChange={handleChange}
                              className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-700">Last Name</Label>
                            <Input 
                              id="lastName" 
                              placeholder="Your last name" 
                              value={formData.lastName}
                              onChange={handleChange}
                              className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="your.email@example.com" 
                            value={formData.email}
                            onChange={handleChange}
                            className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-slate-700">Subject</Label>
                          <Input 
                            id="subject" 
                            placeholder="What's this about?" 
                            value={formData.subject}
                            onChange={handleChange}
                            className="h-12 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-slate-700">Message</Label>
                          <Textarea 
                            id="message" 
                            placeholder="Tell us how we can help you..."
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                            required
                          />
                        </div>

                        <Button 
                          size="lg" 
                          className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 w-5 h-5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </motion.div>

                {/* Support Types */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold mb-2 text-slate-900">What Can We Help With?</h2>
                  <p className="text-slate-600 mb-8">
                    Here are some common reasons people reach out to us:
                  </p>

                  <div className="space-y-6">
                    {supportTypes.map((type, index) => {
                      const IconComponent = type.icon
                      return (
                        <motion.div 
                          key={index} 
                          className="flex gap-5 p-5 rounded-xl border border-slate-200 bg-white/80 group hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ y: -3 }}
                        >
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors duration-300">
                            <IconComponent className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-1">{type.title}</h3>
                            <p className="text-slate-600">{type.description}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-8 p-6 rounded-xl bg-indigo-50/80 border border-indigo-100 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <Headphones className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg text-indigo-800 mb-2">Need Immediate Help?</h3>
                        <p className="text-indigo-700 mb-4">
                          Check out our help center for quick answers to common questions.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                        >
                          Visit Help Center
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* FAQ Section - Enhanced with hover effect to show answers */}
          <section className="py-16 md:py-24 relative overflow-hidden" id="faq">
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
                  >
                    View All FAQs
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Community Section */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative background elements for this section */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30 blur-3xl"></div>
              <div className="absolute bottom-1/4 -right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 opacity-30 blur-3xl"></div>
            </div>
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-slate-900"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5 }}
                >
                  Join Our Community
                </motion.h2>
                <motion.p 
                  className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Connect with other learners, educators, and supporters of accessible education.
                </motion.p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <motion.div 
                    className="p-6 rounded-xl border border-slate-200 bg-white/80 text-center group hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <MessageCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Discord Community</h3>
                    <p className="text-slate-600 mb-5">
                      Join real-time discussions with learners and educators.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Join Discord
                    </Button>
                  </motion.div>

                  <motion.div 
                    className="p-6 rounded-xl border border-slate-200 bg-white/80 text-center group hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Facebook Group</h3>
                    <p className="text-slate-600 mb-5">
                      Share experiences and get support from the community.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Join Group
                    </Button>
                  </motion.div>

                  <motion.div 
                    className="p-6 rounded-xl border border-slate-200 bg-white/80 text-center group hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Globe className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">Newsletter</h3>
                    <p className="text-slate-600 mb-5">
                      Get updates on new courses and platform features.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Subscribe
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
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
                  Ready to Start Learning?
                </motion.h2>
                <motion.p 
                  className="text-xl text-indigo-100 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Don't wait - join thousands of learners who are already transforming their lives through education.
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