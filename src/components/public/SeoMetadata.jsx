import Head from "next/head";
import { useRouter } from "next/router";
import {
  getCanonicalUrl,
  getLocaleAlternates,
} from "@/shared/routing/metadata";

export function SeoMetadata({ title, description }) {
  const router = useRouter();
  const locale = router.locale === "en" ? "en" : "ko";
  const canonical = getCanonicalUrl(router.asPath, locale);
  const alternates = getLocaleAlternates(router.asPath);

  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ko" href={alternates.ko} />
      <link rel="alternate" hrefLang="en" href={alternates.en} />
      <link
        rel="alternate"
        hrefLang="x-default"
        href={alternates["x-default"]}
      />
    </Head>
  );
}
