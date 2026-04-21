/** @type {import('next').NextConfig} */
const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

let backendOrigin = 'http://localhost:8000';

try {
  backendOrigin = new URL(backendApiUrl).origin;
} catch {
  backendOrigin = 'http://localhost:8000';
}

const backendUrl = new URL(backendOrigin);

const nextConfig = {
  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: backendUrl.protocol.replace(':', ''),
        hostname: backendUrl.hostname,
        ...(backendUrl.port ? { port: backendUrl.port } : {}),
        pathname: '/storage/**',
      },
      {
        protocol: "https",
        hostname: "t-express-backend.onrender.com",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
    // Disable image optimization in development to avoid timeout issues
    // Images will be served directly without optimization, which is faster for development
    unoptimized: process.env.NODE_ENV === 'development',
    // Increase cache TTL
    minimumCacheTTL: 60,
    // Add device sizes and image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add formats
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
