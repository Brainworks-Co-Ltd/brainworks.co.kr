import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import Rail from "@/components/public/Rail";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

export default function AreasRail({ areas = [] }) {
  const { language } = useLocale();
  const listPath = getLocalizedPath("solutions.list", language);

  return (
    <section className="py-[120px] lg:py-[250px]">
      <SectionTitle>{homeCopy.areasSection.title[language]}</SectionTitle>
      <div className="bw-reveal">
        <Rail>
          {areas.map((area) => (
            <li
              key={area.id}
              className="group relative aspect-square w-[280px] overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(16,25,27,.25)] lg:w-[409px]"
            >
              <Link
                href={`${listPath}?area=${encodeURIComponent(area.id)}#business-areas`}
                className="relative block h-full w-full"
              >
                <Image
                  src={area.heroImage}
                  alt={area.title || area.name || ""}
                  fill
                  sizes="409px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-8 top-8 text-[26px] font-semibold text-white lg:text-[30px]">
                  {area.title || area.name}
                </span>
                <span className="absolute bottom-8 left-8 text-white">
                  <span className="block text-[15px] font-semibold">
                    {area.subtitle}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold">
                    {language === "ko" ? "자세히 보기" : "Learn more"} <Arrow />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Rail>
      </div>
    </section>
  );
}
