import { useLocale } from "@/shared/routing/useLocale";
import HeroSlot from "@/components/public/HeroSlot";
import { homeCopy } from "@/data/homeCopy";

export default function HomeHero() {
  const { language } = useLocale();
  const slots = homeCopy.heroSlots.map((slot) => slot[language]);

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
