/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  trailingSlash: true,
  i18n: {
    locales: ["ko", "en"],
    defaultLocale: "ko",
    localeDetection: false,
  },
  async redirects() {
    return [
      { source: "/Home", destination: "/", permanent: true },
      { source: "/outbound", destination: "/global-programs", permanent: true },
      {
        source: "/services/consulting",
        destination: "/consulting",
        permanent: true,
      },
      {
        source: "/services/education",
        destination: "/education",
        permanent: true,
      },
      {
        source: "/services/development",
        destination: "/services",
        permanent: true,
      },
    ];
  },
  images: {
    domains: [],
    unoptimized: true,
  },
};

module.exports = nextConfig;
