import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['via.placeholder.com', 'qzelstvozsotobpbedfr.supabase.co', 'placehold.co', 'images.unsplash.com', 'randomuser.me'], // Add the allowed domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Set the limit to 2 MB (adjust as needed)
    },
  },
  env: {
    FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
    FLUTTERWAVE_ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY, // Must be 24 characters
  },

  //remove this, this was added for testing
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during the build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during the build
  },
};

export default nextConfig;
