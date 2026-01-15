import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment compatibility
  reactStrictMode: true,
  
  // Image optimization
  images: {
    unoptimized: true, // Required for better-sqlite3 compatibility
  },
};

export default nextConfig;
