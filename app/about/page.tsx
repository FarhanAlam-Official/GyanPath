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
  Award,
  Lightbulb,
  Shield,
  Zap,
  Star
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
    },
    {
      icon: Shield,
      title: "Privacy Focused",
      description: "Your learning data is protected with industry-leading security and privacy practices."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously innovate to solve unique challenges faced by rural learners and educators."
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                About GyanPath
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Empowering rural communities through accessible, offline-first education. Learn our story and mission.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                className="grid md:grid-cols-2 gap-16 items-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-8">
                  <h2 className="text-4xl md:text-5xl font-bold">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    GyanPath was born from a simple belief: geography should never limit access to quality education. 
                    We're on a mission to democratize learning by making high-quality educational content accessible 
                    to rural communities, even without reliable internet connectivity.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our platform is specifically designed for the unique challenges faced by learners in remote areas - 
                    limited bandwidth, intermittent connectivity, and diverse local needs. We're not just building 
                    another learning platform; we're crafting a solution that truly serves underserved communities.
                  </p>
                  <Button asChild size="lg" className="h-14 px-8 text-lg">
                    <Link href="/auth/signup">
                      Join Our Mission
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <motion.div 
                    className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  >
                    <BookOpen className="w-32 h-32 text-primary" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl text-muted-foreground">
                These numbers represent real lives transformed through accessible education.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center space-y-3"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <div className="text-5xl md:text-6xl font-bold text-primary">{stat.number}</div>
                  <div className="text-xl font-semibold">{stat.label}</div>
                  <div className="text-muted-foreground">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                These core principles guide everything we do at GyanPath.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon
                return (
                  <motion.div 
                    key={index} 
                    className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all group"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <IconComponent className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-16">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Story</h2>
                <p className="text-xl text-muted-foreground">
                  From a small idea to a platform serving thousands across Nepal.
                </p>
              </div>

              <div className="space-y-12">
                <div className="grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xl font-bold">
                      2022
                    </div>
                  </div>
                  <div className="md:col-span-10 space-y-4">
                    <h3 className="text-2xl font-bold">The Beginning</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Founded by educators who witnessed firsthand the challenges of delivering quality education 
                      to remote areas in Nepal. The idea was simple: what if we could make learning work without 
                      depending on internet connectivity?
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-xl flex items-center justify-center text-xl font-bold">
                      2023
                    </div>
                  </div>
                  <div className="md:col-span-10 space-y-4">
                    <h3 className="text-2xl font-bold">First Launch</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Launched our pilot program in 10 districts across Nepal. The response was overwhelming - 
                      communities that had struggled with educational access suddenly had a library of courses 
                      at their fingertips.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="w-16 h-16 bg-accent text-accent-foreground rounded-xl flex items-center justify-center text-xl font-bold">
                      2024
                    </div>
                  </div>
                  <div className="md:col-span-10 space-y-4">
                    <h3 className="text-2xl font-bold">Rapid Growth</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Expanded to 50+ districts with over 10,000 active learners. Added multilingual support, 
                      group learning features, and partnership with local educational institutions.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xl font-bold">
                      Now
                    </div>
                  </div>
                  <div className="md:col-span-10 space-y-4">
                    <h3 className="text-2xl font-bold">Global Vision</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Preparing to expand beyond Nepal to serve rural communities worldwide. Our proven model 
                      is ready to bridge the digital divide in other developing regions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Team</h2>
              <p className="text-xl text-muted-foreground">
                Meet the passionate individuals working to make education accessible to all.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary mx-auto">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Join Us in Transforming Education
              </h2>
              <p className="text-xl text-white/90">
                Whether you're a learner, educator, or supporter of accessible education, 
                there's a place for you in the GyanPath community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                  <Link href="/auth/signup">
                    Start Learning
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg h-14 px-8"
                >
                  <Link href="/contact">Get in Touch</Link>
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