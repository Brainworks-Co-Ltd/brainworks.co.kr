// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  images: {
    domains: [],
    unoptimized: true,
  },
  // (기존 allowedDevOrigins 등 다른 설정은 그대로 둡니다)
}

module.exports = nextConfig;