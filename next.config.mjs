/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds (optional)
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'gsap', 'ai'],
  },
};

export default nextConfig;
