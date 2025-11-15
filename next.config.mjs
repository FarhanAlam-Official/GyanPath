/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable ESLint during builds
  eslint: {
    dirs: ["app", "components", "lib", "hooks"],
  },
  // Enable TypeScript type checking during builds
  typescript: {
    // We'll fix errors gradually, but keep type checking enabled
  },
  images: {
    // Enable image optimization for better performance
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
}

export default nextConfig
