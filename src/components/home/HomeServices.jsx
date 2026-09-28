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
                  className="group relative block aspect-square overflow-hidden rounded-[24px] lg:aspect-[16/11]"
                >
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 612px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {/* 밝은 사진 위에서도 흰 글자가 읽히도록 아래쪽을 충분히 어둡게 깐다. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:p-10">
                    <h3 className="text-[22px] font-semibold text-white lg:text-[26px]">
                      {service.name[language]}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.6] text-white/85 lg:mt-3 lg:text-[16px]">
                      {service.desc[language]}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-white lg:mt-6">
                      {language === "ko" ? "자세히 보기" : "Learn more"}{" "}
                      <Arrow />
                    </span>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
