import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    FIREBASE_CLIENT_CONFIG: process.env.FIREBASE_CLIENT_CONFIG,
  },
}

export default nextConfig
