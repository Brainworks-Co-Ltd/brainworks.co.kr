import { useLocale } from "@/shared/routing/useLocale";
import HeroSlot from "@/components/public/HeroSlot";
import { homeCopy } from "@/data/homeCopy";
import { businessAreas } from "@/data/businessAreas";

export default function HomeHero() {
  const { language } = useLocale();
  const slots = businessAreas.map((area) => area.name[language]);

  return (
    <section className="pt-[150px] pb-16 lg:pt-[190px] lg:pb-24">
      <div className="bw-reveal inner text-center">
        <HeroSlot
          as="h1"
          slots={slots}
          question={homeCopy.heroQuestion[language]}
        />
        <p className="mt-8 text-[18px] leading-[1.5] text-ink lg:text-[22px]">
          {homeCopy.identity[language]}
        </p>
      </div>
    </section>
  );
}
