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
import client8 from "../assets/clients/client8.jpg";

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
            className="flex items-center"
            style={{
              animation: "scroll 36s linear infinite",
              width: "fit-content",
            }}
          >
            {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
              <div
                key={`logo-${index}`}
                className="flex h-32 w-40 flex-shrink-0 items-center justify-center border-r border-[var(--bw-color-line)] px-8 py-8 first:border-l"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={120}
                  className="h-20 w-auto grayscale transition-all duration-300 hover:scale-105 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          div[style*="animation"] {
            animation: none !important;
          }
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
