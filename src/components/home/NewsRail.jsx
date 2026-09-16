import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import Rail from "@/components/public/Rail";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

export default function NewsRail({ items = [] }) {
  const { language } = useLocale();
  const newsPath = getLocalizedPath("news.list", language);

  return (
    <section className="py-[120px] lg:py-[250px]">
      <SectionTitle>{homeCopy.newsSection.title[language]}</SectionTitle>
      <div className="bw-reveal">
        <Rail>
          {items.slice(0, 4).map((item) => (
            <li key={item.slug} className="w-[300px] lg:w-[409px]">
              <Link
                href={getLocalizedPath("news.detail", language, {
                  slug: item.slug,
                })}
                className="group block"
              >
                <div className="relative aspect-[409/268] overflow-hidden rounded-2xl">
                  <Image
                    src={item.thumbnail}
                    alt=""
                    fill
                    sizes="409px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-8 text-[14px] font-bold text-accent-text">
                  {item.category}
                </p>
                <h3 className="mt-3 line-clamp-2 text-[18px] leading-[1.45] text-ink-strong group-hover:underline lg:text-[22px]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[14px] text-muted-foreground">
                  {item.date.replaceAll("-", ".")}
                </p>
              </Link>
            </li>
          ))}
        </Rail>
      </div>
      <div className="bw-reveal mt-16 text-center lg:mt-20">
        <Link href={newsPath} className="pill pill-outline">
          {homeCopy.newsSection.more[language]} <Arrow />
        </Link>
      </div>
    </section>
  );
}
