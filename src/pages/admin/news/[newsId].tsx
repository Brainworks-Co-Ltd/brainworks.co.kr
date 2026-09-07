import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewsForm, type NewsFormValue } from "@/components/admin/NewsForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNews } from "@/server/modules/news/repository";

export default function EditNews({ news }: { news: NewsFormValue }) {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title={news.locales.ko.title || news.locales.en.title || "뉴스 편집"}
        description="내용을 저장한 뒤 국문과 영문의 게시 상태를 각각 관리할 수 있습니다."
      />
      <div className="mt-8">
        <NewsForm initial={news} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const id = typeof context.params?.newsId === "string" ? context.params.newsId : "";
  try {
    const item = await getAdminNews(id);
    const locales = Object.fromEntries(
      item.locales.map((locale) => [
        locale.locale,
        {
          title: locale.title,
          summary: locale.summary,
          bodyMarkdown: locale.bodyMarkdown,
          coverAlt: locale.coverAlt || "",
          publicationStatus: locale.publicationStatus,
        },
      ]),
    ) as NewsFormValue["locales"];
    return {
      props: {
        news: {
          id: item.id,
          version: item.version,
          itemStatus: item.itemStatus,
          slug: item.slug,
          category: item.category,
          displayDate: String(item.displayDate),
          locales,
        },
      },
    };
  } catch {
    return { notFound: true };
  }
}
