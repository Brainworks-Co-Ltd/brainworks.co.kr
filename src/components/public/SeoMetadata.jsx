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
      <title key="title">{title}</title>
      {description ? (
        <meta key="description" name="description" content={description} />
      ) : null}
      <link key="canonical" rel="canonical" href={canonical} />
      <link key="alternate-ko" rel="alternate" hrefLang="ko" href={alternates.ko} />
      <link key="alternate-en" rel="alternate" hrefLang="en" href={alternates.en} />
      <link
        key="alternate-x-default"
        rel="alternate"
        hrefLang="x-default"
        href={alternates["x-default"]}
      />
    </Head>
  );
}
