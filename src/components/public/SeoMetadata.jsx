import Head from "next/head";
import { useRouter } from "next/router";
import {
  getCanonicalUrl,
  getLocaleAlternates,
  publicOrigin,
} from "@/shared/routing/metadata";

// 카카오톡, 링크드인 같은 곳에 링크를 붙였을 때 카드에 뜨는 그림
const shareImage = `${publicOrigin}/images/og/brainworks.png`;

export function SeoMetadata({ title, description }) {
  const router = useRouter();
  const locale = router.locale === "en" ? "en" : "ko";
  const canonical = getCanonicalUrl(router.asPath, locale);
  const alternates = getLocaleAlternates(router.asPath);
  const siteName = locale === "en" ? "Brainworks" : "브레인웍스";

  return (
    <Head>
      <title key="title">{title}</title>
      {description ? (
        <meta key="description" name="description" content={description} />
      ) : null}
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content={siteName} />
      <meta key="og:locale" property="og:locale" content={locale === "en" ? "en_US" : "ko_KR"} />
      <meta key="og:url" property="og:url" content={canonical} />
      <meta key="og:title" property="og:title" content={title} />
      {description ? (
        <meta key="og:description" property="og:description" content={description} />
      ) : null}
      <meta key="og:image" property="og:image" content={shareImage} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content={siteName} />
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
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
