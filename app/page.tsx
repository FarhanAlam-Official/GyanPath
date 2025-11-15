"use client"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookOpen, Video, Award, Users, Download, CheckCircle, Globe, Wifi, ArrowRight, Star, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-3 text-center px-4 md:px-6">
        <p className="text-sm font-medium">
          🎓 New courses added! Start learning today with offline access.{" "}
          <Link href="/auth/signup" className="underline underline-offset-4 hover:no-underline">
            Sign up free
          </Link>
        </p>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
          <div className="container mx-auto px-4 md:px-6 relative py-24 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
                  <Wifi className="w-4 h-4" />
                  <span>Works Offline</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                  Learn Anywhere, Anytime
                </h1>
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed text-pretty">
                  Offline-first learning platform designed for rural communities. Download lessons, study without
                  internet, and earn verified certificates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                    <Link href="/auth/signup">
                      Start Learning Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg h-14 px-8"
                  >
                    <Link href="#how-it-works">
                      <Play className="mr-2 w-5 h-5" />
                      See How It Works
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold">10,000+</div>
                    <div className="text-sm text-white/80">Active Learners</div>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-sm text-white/80">Courses Available</div>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div>
                    <div className="text-3xl font-bold">95%</div>
                    <div className="text-sm text-white/80">Completion Rate</div>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="relative w-full aspect-square">
                  <Image
                    src="/students-learning-on-mobile-devices-in-rural-setti.jpg"
                    alt="Students learning"
                    fill
                    className="rounded-2xl shadow-2xl object-cover"
                    priority
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white text-[#190482] p-6 rounded-xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#C2D9FF] rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-[#190482]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">2,500+</div>
                        <div className="text-sm text-muted-foreground">Certificates Issued</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Everything You Need to Learn Offline</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Designed specifically for low-bandwidth environments with powerful features that work without internet.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Download className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Offline Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Download entire courses and study without internet connection. Perfect for areas with limited
                  connectivity.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Lessons</h3>
                <p className="text-muted-foreground leading-relaxed">
                  High-quality video content optimized for low bandwidth with progress tracking and anti-skip controls.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Group Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join learning groups, collaborate with peers, and track progress together with your community.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Certificates</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Earn PDF certificates with QR codes upon completion. Verify authenticity anytime, anywhere.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Quizzes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Test your knowledge with auto-graded quizzes. Get instant feedback and track your progress.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multilingual</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Learn in your preferred language. Currently supporting English and Nepali with more coming soon.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your learning journey with detailed analytics and completion tracking for every course.
                </p>
              </div>

              <div className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <Wifi className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Auto Sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automatically sync your progress when connected. Never lose your learning data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">How GyanPath Works</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Start learning in three simple steps. No credit card required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                    1
                  </div>
                  <h3 className="text-2xl font-semibold">Sign Up Free</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create your free account in seconds. Choose your role as a learner or instructor.
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
              </div>

              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                    2
                  </div>
                  <h3 className="text-2xl font-semibold">Download Courses</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Browse our catalog and download courses to your device for offline access.
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
              </div>

              <div className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto">
                    3
                  </div>
                  <h3 className="text-2xl font-semibold">Learn & Earn</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Complete lessons, pass quizzes, and earn verified certificates to showcase your skills.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link href="/auth/signup">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">What Our Learners Say</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Join thousands of satisfied learners across Nepal who are transforming their lives through education.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-2xl border bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">
                  "GyanPath changed my life. I can now learn new skills even with our village's limited internet. The
                  offline feature is a game-changer!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    RS
                  </div>
                  <div>
                    <div className="font-semibold">Rajesh Sharma</div>
                    <div className="text-sm text-muted-foreground">Student, Pokhara</div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl border bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">
                  "As an instructor, I love how easy it is to create courses and reach students in remote areas. The
                  platform is intuitive and powerful."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold">
                    SP
                  </div>
                  <div>
                    <div className="font-semibold">Sita Poudel</div>
                    <div className="text-sm text-muted-foreground">Instructor, Kathmandu</div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl border bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed">
                  "The certificates are recognized and have helped me get better job opportunities. Thank you GyanPath
                  for making education accessible!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                    AK
                  </div>
                  <div>
                    <div className="font-semibold">Anil KC</div>
                    <div className="text-sm text-muted-foreground">Graduate, Chitwan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="contact"
          className="py-24 md:py-32 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-xl md:text-2xl text-white/90 text-pretty">
                Join thousands of learners across Nepal accessing quality education offline. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                  <Link href="/auth/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-lg h-14 px-8"
                >
                  <Link href="/learner/browse">Browse Courses</Link>
                </Button>
              </div>
              <p className="text-sm text-white/70">
                Have questions? Email us at{" "}
                <a href="mailto:support@gyanpath.com" className="underline underline-offset-4 hover:no-underline">
                  support@gyanpath.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}