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
};

export default nextConfig;
