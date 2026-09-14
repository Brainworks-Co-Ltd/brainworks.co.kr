import type { GetServerSideProps } from "next";
import { getLocalizedPath } from "@/shared/routing/routes";
import { publicOrigin } from "@/shared/routing/metadata";

const publicRouteKeys = [
  "home",
  "about.ceo",
  "about.history",
  "about.honors",
  "solutions.list",
  "consulting",
  "education",
  "globalPrograms",
  "news.list",
  "contact",
] as const;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls = publicRouteKeys.flatMap((routeKey) =>
    ["ko", "en"].map((locale) =>
      getLocalizedPath(routeKey, locale as "ko" | "en"),
    ),
  );
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        `  <url><loc>${publicOrigin}${url === "/" ? "/" : `${url}/`}</loc></url>`,
    ),
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
