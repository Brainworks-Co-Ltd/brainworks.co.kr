import { useLocale } from "@/shared/routing/useLocale";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import NoticeList from "@/components/notices/NoticeList";
import { getPublishedNoticeCategories, getPublishedNoticeList } from "@/server/modules/notices/queries";

type NoticeItem = { slug: string; title: string; date: string; isPinned: boolean };
type NoticeCategory = { id: string; name: string };
type NoticeQuery = { q: string; categoryId: string; page: number };
type NoticeData = { items: NoticeItem[]; page: number; totalPages: number };
type NoticesProps = { data: NoticeData; categories: NoticeCategory[]; query: NoticeQuery };

export default function NoticesPage({ data, categories, query }: NoticesProps) {
  const { language } = useLocale();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <SeoMetadata title={language === "ko" ? "공지사항 | 브레인웍스" : "Notices | Brainworks"} description={language === "ko" ? "브레인웍스의 공식 공지사항입니다." : "Official notices from Brainworks."} />
      <main id="main-content" className="pb-20">
        <PageHero eyebrow="Brainworks Notices" title={language === "ko" ? "공지사항" : "Notices"} description={language === "ko" ? "브레인웍스의 주요 안내와 소식을 확인하세요." : "Find important updates and announcements from Brainworks."} />
        <div className="mx-auto max-w-6xl px-6 py-12">
          <form className="mb-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 md:flex-row" method="get">
            <label className="sr-only" htmlFor="notice-search">{language === "ko" ? "공지사항 검색" : "Search notices"}</label>
            <input id="notice-search" name="q" defaultValue={query.q || ""} placeholder={language === "ko" ? "제목 검색" : "Search by title"} className="min-h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-sky-400" />
            {categories.length ? <><label className="sr-only" htmlFor="notice-category">{language === "ko" ? "카테고리" : "Category"}</label><select id="notice-category" name="category" defaultValue={query.categoryId || ""} className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm"><option value="">{language === "ko" ? "전체 카테고리" : "All categories"}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></> : null}
            <button className="min-h-11 rounded-full bg-[var(--bw-color-ink)] px-6 text-sm font-semibold text-white" type="submit">{language === "ko" ? "검색" : "Search"}</button>
          </form>
          <NoticeList items={data.items} page={data.page} totalPages={data.totalPages} query={query} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale, query }: { locale?: string; query: Record<string, string | string[] | undefined> }) {
  const currentLocale = locale === "en" ? "en" : "ko";
  const normalized = { q: typeof query.q === "string" ? query.q : "", categoryId: typeof query.category === "string" ? query.category : "", page: Number(query.page) || 1 };
  const [data, categories] = await Promise.all([getPublishedNoticeList(currentLocale, normalized), getPublishedNoticeCategories(currentLocale)]);
  return { props: { data, categories, query: normalized } };
}
