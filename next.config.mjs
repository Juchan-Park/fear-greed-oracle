/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force pages router only
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Disable app directory completely
  experimental: {},
}

export default nextConfig;
