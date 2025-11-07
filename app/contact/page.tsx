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
  Send
} from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
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
  ]

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
  ]

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
    },
    {
      question: "How do certificates work?",
      answer: "Upon completing a course, you receive a PDF certificate with a QR code. Anyone can verify the certificate's authenticity by scanning the QR code or visiting our verification page."
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
                Get in Touch
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Have questions? Need support? Want to partner with us? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How to Reach Us</h2>
              <p className="text-xl text-muted-foreground">
                Choose the method that works best for you. We're here to help!
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon
                return (
                  <div key={index} className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                    {method.link !== "#" ? (
                      <a 
                        href={method.link} 
                        className="text-primary hover:underline font-medium"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <p className="text-primary font-medium">{method.value}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Support Types */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Send Us a Message</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Your last name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What's this about?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us how we can help you..."
                      rows={6}
                    />
                  </div>

                  <Button size="lg" className="w-full h-14 text-lg">
                    <Send className="mr-2 w-5 h-5" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Support Types */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">What Can We Help With?</h2>
                <p className="text-muted-foreground mb-8">
                  Here are some common reasons people reach out to us:
                </p>

                <div className="space-y-6">
                  {supportTypes.map((type, index) => {
                    const IconComponent = type.icon
                    return (
                      <div key={index} className="flex gap-4 p-4 rounded-xl border bg-card">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{type.title}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 text-primary">Need Immediate Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check out our help center for quick answers to common questions.
                  </p>
                  <Button variant="outline" size="sm">
                    Visit Help Center
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-muted-foreground">
                  Quick answers to common questions about GyanPath.
                </p>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-6 rounded-xl border bg-card">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">
                  Don't see your question here?
                </p>
                <Button variant="outline" size="lg">
                  View All FAQs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">Join Our Community</h2>
              <p className="text-xl text-muted-foreground">
                Connect with other learners, educators, and supporters of accessible education.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 rounded-xl border bg-card text-center">
                  <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Discord Community</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join real-time discussions with learners and educators.
                  </p>
                  <Button variant="outline" size="sm">Join Discord</Button>
                </div>

                <div className="p-6 rounded-xl border bg-card text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Facebook Group</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share experiences and get support from the community.
                  </p>
                  <Button variant="outline" size="sm">Join Group</Button>
                </div>

                <div className="p-6 rounded-xl border bg-card text-center">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Newsletter</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get updates on new courses and platform features.
                  </p>
                  <Button variant="outline" size="sm">Subscribe</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-[#190482] via-[#7752FE] to-[#8E8FFA] text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-white/90">
                Don't wait - join thousands of learners who are already transforming their lives through education.
              </p>
              <Button asChild size="lg" className="bg-white text-[#190482] hover:bg-white/90 text-lg h-14 px-8">
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}