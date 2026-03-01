import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent bundling of native modules
      config.externals = config.externals || []
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'mammoth': 'commonjs mammoth',
      })
    }
    return config
  },
}

export default config
