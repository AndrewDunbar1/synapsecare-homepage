/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: process.env.NODE_ENV === 'production' ? '/synapsecare-homepage' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/synapsecare-homepage/' : '',
  trailingSlash: true,
}

module.exports = nextConfig 