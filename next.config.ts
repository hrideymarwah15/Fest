import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper output for Vercel
  output: "standalone",

  // Experimental features
  experimental: {
    // Disable Turbopack for production builds if needed
  },
};

export default nextConfig;
