/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  }
}

// Proxy /api and /auth requests to external API in development to avoid CORS issues.
// If NEXT_PUBLIC_API_URL is set to an absolute URL, lib/api.ts will use it directly.
nextConfig.rewrites = async () => {
  return [
    {
      source: '/api/:path*',
      destination: 'https://unimentor-api.pp.ua/api/:path*',
    },
    {
      source: '/auth/:path*',
      destination: 'https://unimentor-api.pp.ua/auth/:path*',
    },
  ]
}

export default nextConfig
