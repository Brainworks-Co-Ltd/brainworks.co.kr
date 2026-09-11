import { useLocale } from "@/shared/routing/useLocale";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import NoticeDetail from "@/components/notices/NoticeDetail";
import { markdownToHtml } from "@/lib/markdown";
import {
  getPublishedNoticeDetail,
  getPublishedNoticePublicNumberByLegacySlug,
} from "@/server/modules/notices/queries";
import { resolvePublishedNoticeRoute } from "@/server/modules/notices/public-route";

type NoticeDetailProps = {
  title: string;
  date: string;
  bodyMarkdown: string;
  contentHtml: string;
  summary: string;
  backHref: string;
  attachments: Array<{ id: string; displayName: string; downloadUrl: string }>;
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
        description={notice.summary}
      />
      <main id="main-content">
        <PageHero
          variant="plain"
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
  const currentLocale = locale === "en" ? "en" : "ko";
  const route = await resolvePublishedNoticeRoute(params.slug, currentLocale, {
    getByPublicNumber: getPublishedNoticeDetail,
    getPublicNumberByLegacySlug:
      getPublishedNoticePublicNumberByLegacySlug,
  });
  if (route.kind === "notFound") return { notFound: true };
  if (route.kind === "redirect") {
    return {
      redirect: {
        destination: route.destination,
        permanent: true,
      },
    };
  }
  const notice = route.notice;
  const paramsForBack = new URLSearchParams();
  if (typeof query.q === "string") paramsForBack.set("q", query.q);
  if (typeof query.category === "string")
    paramsForBack.set("category", query.category);
  if (typeof query.page === "string") paramsForBack.set("page", query.page);
  const strippedBody = notice.bodyMarkdown
    .replace(/[#*>`_[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const summary = strippedBody || notice.title;
  return {
    props: {
      notice: {
        ...notice,
        contentHtml: markdownToHtml(notice.bodyMarkdown),
        summary,
        backHref: paramsForBack.toString()
          ? `/notices?${paramsForBack.toString()}`
          : "/notices",
      },
    },
  };
}
