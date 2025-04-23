import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactStrictMode: false, // Disable strict mode in development for better performance
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize development experience
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
