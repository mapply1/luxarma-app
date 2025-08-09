/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'iconoir-react'],
  },
  
  // Bundle optimization
  transpilePackages: ['lucide-react', 'iconoir-react'],
  
  // Environment-specific settings
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript - temporarily ignore build errors for production
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Production optimization
  poweredByHeader: false,
  compress: true,
  
  // Asset optimization - unoptimized for static export
  images: {
    unoptimized: true,
    domains: ['ycdyarkrxkhqkpkzvdno.supabase.co', 'images.unsplash.com', 'images.pexels.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
