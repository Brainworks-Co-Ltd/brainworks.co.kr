import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

export default function HomeServices() {
  const { language } = useLocale();
  const section = homeCopy.serviceSection;

  return (
    <section id="services" className="py-[120px] lg:py-[250px]">
      <div className="inner">
        <SectionTitle sub={section.subtitle[language]}>
          {section.title[language]}
        </SectionTitle>
        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {homeCopy.services.map((service, index) => (
            <li key={service.id} className="h-full">
              <div
                className="bw-reveal h-full"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Link
                  href={getLocalizedPath(service.routeKey, language)}
                  className="block h-full rounded-[24px] bg-tint p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(16,25,27,.25)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 612px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-6 text-[24px] font-semibold text-ink-strong">
                    {service.name[language]}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[1.6]">
                    {service.desc[language]}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-ink">
                    {language === "ko" ? "자세히 보기" : "Learn more"} <Arrow />
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
