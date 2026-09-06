import React from "react";
import Image from "next/image";
import { useLocale } from "@/shared/routing/useLocale";
import { SectionHeader } from "@/components/public/SectionHeader";
import client1 from "../assets/clients/client1.png";
import client2 from "../assets/clients/client2.jpg";
import client3 from "../assets/clients/client3.png";
import client4 from "../assets/clients/client4.png";
import client5 from "../assets/clients/client5.jpg";
import client6 from "../assets/clients/client6.jpg";
import client7 from "../assets/clients/client7.png";
// client8은 투명 PNG가 이미 있는데 불투명 jpg를 가리키고 있었다
import client8 from "../assets/clients/client8.png";

export default function Clients() {
  const { language } = useLocale();
  const logos = [
    { src: client1, alt: "client1" },
    { src: client2, alt: "client2" },
    { src: client3, alt: "client3" },
    { src: client4, alt: "client4" },
    { src: client5, alt: "client5" },
    { src: client6, alt: "client6" },
    { src: client7, alt: "client7" },
    { src: client8, alt: "client8" },
  ];

  return (
    <section
      id="clients"
      className="bw-clients border-y border-[var(--bw-color-line)] bg-[var(--bw-color-surface-muted)] py-20 text-[var(--bw-color-ink)] md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Clients & partners"
          title={
            language === "ko" ? "주요 고객 및 파트너" : "Clients & partners"
          }
          description={
            language === "ko"
              ? "브레인웍스와 함께한 기업과 기관을 소개합니다."
              : "A selection of organizations that have worked with Brainworks."
          }
        />

        {/* 로고는 반복 이동 없이 한 번씩 보여준다. 비율과 원래 색은 유지한다. */}
        <div className="bw-client-grid mt-12">
          {logos.map((logo) => (
            <div key={logo.alt} className="bw-client-grid__item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={120}
                className="max-h-14 w-auto max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
