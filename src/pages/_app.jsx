import "@/styles/globals.css";
import { SkipLink } from "@/components/public/SkipLink";
import { SeoMetadata } from "@/components/public/SeoMetadata";

export default function App({ Component, pageProps }) {
  return (
    <>
      <SkipLink />
      <SeoMetadata title="Brainworks" />
      <Component {...pageProps} />
    </>
  );
}
