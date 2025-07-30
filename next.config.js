/** @type {import('next').NextConfig} */
const nextConfig = {  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    domains: ['localhost', 'firebasestorage.googleapis.com'],
  },

  serverExternalPackages: ['drizzle-orm'],

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },

    optimizeCss: false,
    scrollRestoration: true,
  },

  turbopack: {

  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer, dev }) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    
    return config;
  }
}

module.exports = nextConfig 