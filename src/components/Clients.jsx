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

        <div className="relative mt-12 overflow-hidden border-y border-[var(--bw-color-line)]">
          <div
            className="animate-scroll flex items-center"
            style={{
              animationDuration: "36s",
              width: "fit-content",
            }}
          >
            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={`logo-${index}`}
                /*
                 * 로고 여덟 개 중 다섯이 흰 바탕을 물고 있다. jpg 넷은
                 * 포맷상 투명이 불가능하고 client4.png는 알파가 없다.
                 * mix-blend-multiply를 걸어봤으나 자산마다 결과가 달랐다
                 * (실측: 투명 PNG 247,248,249 / KATECH 235 / KOSME 255).
                 *
                 * 타일을 흰 면으로 두면 포맷과 무관하게 흰 바탕이 보이지
                 * 않는다. 회색 띠 위의 흰 카드가 되어 의도한 모양이 된다.
                 */
                className="flex h-32 w-auto min-w-44 max-w-72 flex-shrink-0 items-center justify-center border-r border-[var(--bw-color-line)] bg-white px-8 py-8 first:border-l"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={120}
                  /*
                   * 로고마다 가로세로 비율이 다르다 (정사각 1:1부터
                   * 한국비즈니스IT협회 5.65:1까지). 높이만 고정하고
                   * object-contain 없이 두면 좁은 상자에서 가로가 눌린다.
                   * 실측: 원본 5.65:1이 1.19:1로 렌더돼 글자가 안 읽혔다.
                   *
                   * 높이 상한만 두고 폭은 비율대로 가게 한다. 타일도 폭을
                   * 내용에 맞춰 늘리되 상한을 둬서 한 칸이 화면을 먹지
                   * 않게 한다.
                   */
                  className="max-h-14 w-auto max-w-full object-contain grayscale transition-all duration-300 hover:scale-105 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
