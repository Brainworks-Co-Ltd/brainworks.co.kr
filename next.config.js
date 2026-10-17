const assetOrigin = process.env.ASSET_PUBLIC_BASE_URL
  ? new URL(process.env.ASSET_PUBLIC_BASE_URL)
  : undefined;

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
  async rewrites() {
    // 관리자가 올린 이미지는 빌드 뒤에 서버 디스크에 생기므로 public 대신 API가 읽어 준다.
    return [{ source: "/media/:file", destination: "/api/media/:file" }];
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
      // public 파일은 기본이 max-age=0이라 홈 영상을 재방문마다 통째로 다시 받는다.
      // 파일 이름에 해시가 없으니 같은 이름으로 바꿔 넣으면 최대 7일 동안 예전 파일이 보인다.
      ...["/fonts/:path*", "/videos/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      })),
    ];
  },
  images: {
    remotePatterns: assetOrigin
      ? [
          {
            protocol: assetOrigin.protocol.replace(":", ""),
            hostname: assetOrigin.hostname,
            pathname: "/**",
          },
        ]
      : [],
  },
};

module.exports = nextConfig;
