import { useLocale } from "@/shared/routing/useLocale";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import NoticeDetail from "@/components/notices/NoticeDetail";
import { markdownToHtml } from "@/lib/markdown";
import { getPublishedNoticeDetail } from "@/server/modules/notices/queries";

type NoticeDetailProps = {
  title: string;
  date: string;
  bodyMarkdown: string;
  contentHtml: string;
  backHref: string;
  attachments: never[];
};

export default function NoticeDetailPage({
  notice,
}: {
  notice: NoticeDetailProps;
}) {
  const { language } = useLocale();
  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata
        title={`${notice.title} | ${language === "ko" ? "브레인웍스 공지사항" : "Brainworks Notices"}`}
        description={notice.title}
      />
      <main id="main-content">
        <PageHero
          eyebrow={language === "ko" ? "공지사항" : "Notice"}
          title={notice.title}
          description={notice.date}
        />
        <NoticeDetail notice={notice} />
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({
  params,
  locale,
  query,
}: {
  params: { slug: string };
  locale?: string;
  query: Record<string, string | string[] | undefined>;
}) {
  const notice = await getPublishedNoticeDetail(
    params.slug,
    locale === "en" ? "en" : "ko",
  );
  if (!notice) return { notFound: true };
  const paramsForBack = new URLSearchParams();
  if (typeof query.q === "string") paramsForBack.set("q", query.q);
  if (typeof query.category === "string")
    paramsForBack.set("category", query.category);
  if (typeof query.page === "string") paramsForBack.set("page", query.page);
  return {
    props: {
      notice: {
        ...notice,
        contentHtml: markdownToHtml(notice.bodyMarkdown),
        backHref: paramsForBack.toString()
          ? `/notices?${paramsForBack.toString()}`
          : "/notices",
        attachments: [],
      },
    },
  };
}
