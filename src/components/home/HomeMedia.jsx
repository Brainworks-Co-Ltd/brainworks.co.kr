import Image from "next/image";
import { useLocale } from "@/shared/routing/useLocale";
import client1 from "@/assets/clients/client1.png";
import client2 from "@/assets/clients/client2.jpg";
import client3 from "@/assets/clients/client3.png";
import client4 from "@/assets/clients/client4.png";
import client5 from "@/assets/clients/client5.jpg";
import client6 from "@/assets/clients/client6.jpg";
import client7 from "@/assets/clients/client7.png";
import client8 from "@/assets/clients/client8.png";
import { homeCopy } from "@/data/homeCopy";

const clients = [
  client1,
  client2,
  client3,
  client4,
  client5,
  client6,
  client7,
  client8,
];

export default function HomeMedia() {
  const { language } = useLocale();
  const copy = homeCopy.media;

  return (
    <section>
      <div className="bw-reveal inner">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-ink-strong lg:aspect-[1296/560]">
          <Image
            src="/images/services/hero/manufacturing.webp"
            alt=""
            fill
            priority
            loading="eager"
            fetchPriority="high"
            sizes="1296px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <p className="absolute bottom-8 left-8 text-[26px] font-semibold leading-[1.25] text-white lg:bottom-12 lg:left-12 lg:text-[44px]">
            {copy.eyebrow[language]}
            <br />
            {copy.title[language]}
          </p>
        </div>
      </div>
      <div className="mt-16 overflow-hidden" aria-hidden="true">
        <div className="marquee items-center">
          {[...clients, ...clients].map((client, index) => (
            <span key={index} className="mx-12 shrink-0">
              <Image
                src={client}
                alt=""
                width={120}
                height={52}
                style={{ width: "auto", height: "52px" }}
                className="object-contain"
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
