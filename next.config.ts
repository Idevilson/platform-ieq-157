import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    FIREBASE_CLIENT_CONFIG: process.env.FIREBASE_CLIENT_CONFIG,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
}

export default nextConfig
