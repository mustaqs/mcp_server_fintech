/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000',
  },
  // Note: i18n config has been removed as it's not compatible with App Router
  // For internationalization in App Router, use middleware or route groups
}

module.exports = nextConfig
