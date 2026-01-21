/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone output for optimized Docker deployments (smaller image, faster startup)
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  transpilePackages: ['framer-motion'],

  experimental: {
    // Optimize heavy package imports for faster startup
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@supabase/auth-helpers-nextjs',
      'gsap',
      'ai',
      'lucide-react',
      'framer-motion',
      'three',
      '@tabler/icons-react',
    ],
  },

  // Reduce build output verbosity
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
