import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['via.placeholder.com', 'qzelstvozsotobpbedfr.supabase.co'], // Add the allowed domains here
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
};

export default nextConfig;
