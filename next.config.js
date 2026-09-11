/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  trailingSlash: true,
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    domains: [],
    unoptimized: true,
  },
};

module.exports = nextConfig;
