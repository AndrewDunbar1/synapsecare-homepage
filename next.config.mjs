let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add output: 'export' for static site generation
  output: 'export',
  // No basePath for custom domain
  // basePath: '/synapsecare-homepage',
  // Enable trailing slash for better compatibility
  trailingSlash: true,
  // No asset prefix for custom domain
  // assetPrefix: '/synapsecare-homepage',
  // Skip prerendering 404 page
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add ignoreBuildErrors for TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: false,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
