// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // GitHub Pages용 정적 export
  output: 'export',

  // /about → /about/index.html 구조로 생성
  trailingSlash: true,

  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },

  images: {
    domains: [],
    unoptimized: true,
  },
};

module.exports = nextConfig;
