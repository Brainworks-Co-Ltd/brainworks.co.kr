import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";

export default function NotFoundPage() {
  const { locale } = useRouter();
  const isEnglish = locale === "en";

  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <SeoMetadata
        title={isEnglish ? "Page not found" : "요청하신 페이지를 찾을 수 없습니다"}
      />
      <Header />
      <main id="main-content">
        <PageHero
          title={
            isEnglish ? "Page not found" : "요청하신 페이지를 찾을 수 없습니다"
          }
          description={
            isEnglish
              ? "The page may have been moved or removed."
              : "주소가 바뀌었거나 삭제된 페이지입니다."
          }
          action={{ href: "/", label: isEnglish ? "Back to home" : "홈으로 돌아가기" }}
        />
      </main>
      <Footer />
    </div>
  );
}
