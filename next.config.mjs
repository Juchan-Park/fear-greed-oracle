/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force pages router only
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Disable app directory completely
  experimental: {},
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  transpilePackages: [
    '@farcaster/frame-sdk',
    '@farcaster/frame-wagmi-connector',
    'wagmi',
    'viem'
  ]
}

export default nextConfig;
