import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";

export default function BidNoticeGone() {
  const { locale } = useRouter();
  const isEnglish = locale === "en";
  const title = isEnglish
    ? "Bid notices are no longer available."
    : "입찰공고 서비스를 종료했습니다.";

  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata
        title={title}
        description={
          isEnglish
            ? "This service has been permanently discontinued."
            : "입찰공고 서비스는 영구적으로 종료되어 더 이상 제공하지 않습니다."
        }
      />
      <main id="main-content">
        <PageHero
          eyebrow="410"
          title={title}
          description={
            isEnglish
              ? "The requested bid notice has been permanently removed."
              : "요청하신 입찰공고 경로는 더 이상 공개하지 않습니다."
          }
        />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            {isEnglish ? "Go to home" : "홈으로 이동"}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.statusCode = 410;
  return { props: {} };
};
