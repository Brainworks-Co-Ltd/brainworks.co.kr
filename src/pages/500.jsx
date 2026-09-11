import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";

export default function ServerErrorPage() {
  const { locale } = useRouter();
  const isEnglish = locale === "en";

  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <SeoMetadata
        title={isEnglish ? "Something went wrong" : "일시적인 오류가 발생했습니다"}
      />
      <Header />
      <main id="main-content">
        <PageHero
          title={
            isEnglish ? "Something went wrong" : "일시적인 오류가 발생했습니다"
          }
          description={
            isEnglish
              ? "Please try again in a moment."
              : "잠시 후 다시 시도해 주세요."
          }
          action={{ href: "/", label: isEnglish ? "Back to home" : "홈으로 돌아가기" }}
        />
      </main>
      <Footer />
    </div>
  );
}
