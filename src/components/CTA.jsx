import React from "react";
import { useLocale } from "@/shared/routing/useLocale";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";

export default function CTA() {
  const { language } = useLocale();

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ContactCtaBlock
          title={
            language === "ko"
              ? "AX 혁신을 함께하세요"
              : "Join Us in the AX Innovation Journey"
          }
          description={
            language === "ko"
              ? "브레인웍스와 함께 AX를 준비하세요"
              : "Prepare for the AX with Brainworks"
          }
          label={language === "ko" ? "문의하기" : "Contact us"}
        />
      </div>
    </section>
  );
}
