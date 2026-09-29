import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupNoticeRegion from "@/components/popup-notices/PopupNoticeRegion";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import HomeHero from "@/components/home/HomeHero";
import HomeMedia from "@/components/home/HomeMedia";
import HomeServices from "@/components/home/HomeServices";
import HomeProofs from "@/components/home/HomeProofs";
import AreasRail from "@/components/home/AreasRail";
import SolutionsRail from "@/components/home/SolutionsRail";
import NewsRail from "@/components/home/NewsRail";
import { useLocale } from "@/shared/routing/useLocale";
import { homeCopy } from "@/data/homeCopy";
import { getPublishedBusinessAreas } from "@/server/modules/catalog/queries";
import { getPublishedNewsList } from "@/server/modules/news/query-service";
import { getPublishedPopupNotices } from "@/server/modules/popup-notices/queries";

export default function Home({ newsItems, popupNotices, areas }) {
  const { language } = useLocale();
  const copy = homeCopy.contact;
  return (
    <div className="min-h-screen">
      <Header />
      <SeoMetadata
        title={language === "ko" ? "브레인웍스" : "Brainworks"}
        description={homeCopy.identity[language]}
      />
      <main id="main-content" className="bw-home">
        <PopupNoticeRegion notices={popupNotices} />
        <HomeHero />
        <HomeMedia />
        <HomeServices />
        <HomeProofs />
        <AreasRail areas={areas} />
        <SolutionsRail areas={areas} />
        <NewsRail items={newsItems} />
        <ContactCtaBlock
          className="home-contact-cta"
          title={copy.title[language]}
          description={copy.description[language]}
          label={copy.label[language]}
        />
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  const currentLocale = locale === "en" ? "en" : "ko";
  const [newsList, popupNotices, areas] = await Promise.all([
    getPublishedNewsList({ locale: currentLocale }),
    getPublishedPopupNotices(currentLocale),
    getPublishedBusinessAreas(currentLocale),
  ]);

  return {
    props: {
      newsItems: newsList.items,
      popupNotices,
      areas,
    },
  };
}
