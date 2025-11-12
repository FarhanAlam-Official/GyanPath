"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Mail } from "lucide-react"
import { motion } from "framer-motion"

export function SiteFooter() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <Image
                  src="/logo.png"
                  alt="GyanPath logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain rounded-md"
                  priority
                />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold text-lg tracking-tight">
                  GyanPath
                </span>
              </Link>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering rural communities through offline-first education. Learn anywhere, anytime.
            </p>
            <div className="flex items-center gap-3">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
                aria-label="Facebook"
                whileHover={{ y: -3, backgroundColor: "#4f46e5" }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
                aria-label="Twitter"
                whileHover={{ y: -3, backgroundColor: "#4f46e5" }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-4 h-4" />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
                aria-label="Instagram"
                whileHover={{ y: -3, backgroundColor: "#4f46e5" }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/features" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Features
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/how-it-works" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    How It Works
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/courses" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Course Catalogue
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/auth/signup" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Become an Instructor
                  </Link>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/about" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    About Us
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/contact" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Contact
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <Link href="/verify" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Verify Certificate
                  </Link>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <a href="#" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Help Center
                  </a>
                </motion.div>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <a href="#" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </a>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <a href="#" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </a>
                </motion.div>
              </li>
              <li>
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 500 }}>
                  <a href="#" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                    Cookie Policy
                  </a>
                </motion.div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} GyanPath. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <a href="mailto:support@gyanpath.com" className="hover:text-indigo-600 transition-colors">
              support@gyanpath.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}