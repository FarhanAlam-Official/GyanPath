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
  BarChart3,
  MessageCircle,
  FileText,
  Headphones
} from "lucide-react"
import Link from "next/link"

export default function FeaturesPage() {
  const features = [
    {
      icon: Download,
      title: "Offline Learning",
      description: "Download entire courses and study without internet connection. Perfect for areas with limited connectivity.",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
    },
    {
      icon: Video,
      title: "High-Quality Video Lessons",
      description: "Optimized video content for low bandwidth with progress tracking and anti-skip controls.",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
    },
    {
      icon: Users,
      title: "Group Learning",
      description: "Join learning groups, collaborate with peers, and track progress together with your community.",
      color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
    },
    {
      icon: Award,
      title: "Verified Certificates",
      description: "Earn PDF certificates with QR codes upon completion. Verify authenticity anytime, anywhere.",
      color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
    },
    {
      icon: BookOpen,
      title: "Interactive Quizzes",
      description: "Test your knowledge with auto-graded quizzes. Get instant feedback and track your progress.",
      color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Learn in your preferred language. Currently supporting English and Nepali with more coming soon.",
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
    },
    {
      icon: CheckCircle,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and completion tracking for every course.",
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400"
    },
    {
      icon: Wifi,
      title: "Auto Sync",
      description: "Automatically sync your progress when connected. Never lose your learning data.",
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Your learning data is encrypted and securely stored. Privacy-first approach to education.",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Learn at your own pace with no time restrictions. Pause and resume courses anytime.",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Responsive design that works perfectly on all devices - phones, tablets, and computers.",
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
    },
    {
      icon: Cloud,
      title: "Cloud Backup",
      description: "Automatic backup of your progress to the cloud when internet is available.",
      color: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights into your learning patterns and performance metrics.",
      color: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
    },
    {
      icon: MessageCircle,
      title: "Discussion Forums",
      description: "Connect with fellow learners and instructors in course-specific discussion forums.",
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400"
    },
    {
      icon: FileText,
      title: "Study Materials",
      description: "Access comprehensive study materials including notes, PDFs, and practice exercises.",
      color: "bg-lime-50 text-lime-600 dark:bg-lime-950 dark:text-lime-400"
    },
    {
      icon: Headphones,
      title: "Audio Lessons",
      description: "Listen to audio-only lessons while commuting or when video isn't practical.",
      color: "bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Powerful Features for Modern Learning
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Discover all the tools and capabilities that make GyanPath the perfect choice for offline education in rural communities.
              </p>
              <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                <Link href="/auth/signup">
                  Start Learning Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Learn Offline</h2>
              <p className="text-xl text-muted-foreground">
                Comprehensive features designed specifically for low-bandwidth environments and rural learning needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.color} transition-colors`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of learners who are already benefiting from our comprehensive offline learning platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-14 px-8 text-lg">
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg">
                  <Link href="/learner/browse">Browse Courses</Link>
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