import { useLocale } from "@/shared/routing/useLocale";
import { EditorialList } from "@/components/public/EditorialList";
import { EditorialSection } from "@/components/public/EditorialSection";

export default function LatestNews({ items = [] }) {
  const { language } = useLocale();
  const stories = items.slice(0, 4).map((item) => ({
    href: `/news/${item.slug}`,
    title: item.title,
    summary: item.summary,
    tag: item.category,
    meta: item.date,
    image: item.thumbnail,
  }));

  return (
    <div id="news" aria-label={language === "ko" ? "최신 소식" : "Latest news"}>
      <EditorialSection
        eyebrow="Brainworks News"
        title={language === "ko" ? "브레인웍스 소식" : "Latest news"}
        description={
          language === "ko"
            ? "회사 동향부터 파트너십, 수상 소식까지 한눈에 확인하세요."
            : "Company updates, partnerships, and milestones in one place."
        }
        href="/news"
        linkLabel={language === "ko" ? "전체 소식 보기" : "View all news"}
        surface="plain"
      >
        {stories.length === 0 ? (
          <p className="border-y border-[var(--bw-color-line)] py-8 text-sm text-[var(--bw-color-muted)]">
            {language === "ko"
              ? "등록된 소식이 없습니다."
              : "No news has been published yet."}
          </p>
        ) : (
          <EditorialList featured={stories[0]} items={stories.slice(1)} />
        )}
      </EditorialSection>
    </div>
  );
}
