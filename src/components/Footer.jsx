import React from "react";
import Link from "next/link";
import { buildPublicNavigation } from "@/shared/navigation/publicNavigation";
import { useLocale } from "@/shared/routing/useLocale";
import certificationsData from "@/utils/certificationsData";

const certLabel = {
  ko: "인증 및 공급기업 자격",
  en: "Certifications & Provider Status",
};

const offices = [
  {
    label: { ko: "본사", en: "HQ (Daegu)" },
    address: {
      ko: "대구광역시 동구 장등로 76, 대구콘텐츠기업지원센터 211호",
      en: "211, Daegu Contents Enterprise Support Center, 76 Jangdeung-ro, Dong-gu, Daegu",
    },
  },
  {
    label: { ko: "경북본사", en: "North Gyeongsang" },
    address: {
      ko: "경북 경산시 진량읍 대구대로 230, C동 102호, C-13",
      en: "C-13, 102 Bldg C, 230 Daegu-daero, Jinryang-eup, Gyeongsan-si, Gyeongbuk",
    },
  },
  {
    label: { ko: "경남본사", en: "South Gyeongsang" },
    address: {
      ko: "경남 창원시 의창구 차룡로48번길 44, 스마트업타워 2층 알204호",
      en: "Smart-Up Tower 2F A204, 44 Charyong-ro 48-gil, Uichang-gu, Changwon-si, Gyeongnam",
    },
  },
  {
    label: { ko: "충남본사", en: "Chungnam" },
    address: {
      ko: "충남 아산시 배방읍 광장로 210, 202동 1층 a125호",
      en: "a125, 1F, Bldg 202, 210 Gwangjang-ro, Baebang-eup, Asan-si, Chungnam",
    },
  },
  {
    label: { ko: "광주본사", en: "Gwangju" },
    address: {
      ko: "광주 동구 금남로 193-22 광주AI창업캠프 1호, 4층 403호",
      en: "403, 4F, Gwangju AI Startup Camp, 193-22 Geumnam-ro, Dong-gu, Gwangju",
    },
  },
];

export default function Footer() {
  const { language } = useLocale();
  const navigation = buildPublicNavigation(language);
  const groups = navigation.filter((item) => item.type === "group");
  const contact = navigation.find((item) => item.id === "contact");

  return (
    <footer className="bg-[var(--bw-color-ink)] text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,_1fr)_minmax(0,_0.6fr)]">
          <div className="space-y-6">
            <div>
              <span className="text-2xl font-semibold text-white">
                Brainworks
              </span>
              <p className="mt-3 text-sm text-slate-400">
                {language === "ko"
                  ? "데이터와 AI로 고객의 혁신을 실현하는 파트너, 브레인웍스입니다."
                  : "Brainworks is your partner for turning data and AI into real business impact."}
              </p>
            </div>
            <nav
              aria-label={language === "ko" ? "보조 메뉴" : "Footer navigation"}
              className="grid gap-8 sm:grid-cols-3"
            >
              {groups.map((group) => (
                <div key={group.id}>
                  <h2 className="text-sm font-semibold text-white">
                    {group.label}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {group.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          className="text-sm text-slate-400 transition hover:text-white"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {contact ? (
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {contact.label}
                  </h2>
                  <Link
                    href={contact.href}
                    className="mt-3 inline-flex text-sm text-slate-400 transition hover:text-white"
                  >
                    {contact.label}
                  </Link>
                </div>
              ) : null}
            </nav>
            <div className="space-y-1 text-sm">
              <p className="text-slate-300">Email · austin@brainworks.co.kr</p>
              <p className="text-slate-300">Tel · +82-10-6639-4084</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {offices.map((office) => (
              <div
                key={office.label.en}
                className="rounded-[var(--bw-radius-card)] border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {office.label[language]}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {office.address[language]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {certificationsData.length > 0 && (
          <section
            aria-label={certLabel[language]}
            className="border-t border-slate-800 pt-8"
          >
            <h2 className="text-sm font-semibold text-white">
              {certLabel[language]}
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {certificationsData.map((cert) => (
                <li
                  key={cert.slug}
                  className="rounded-[var(--bw-radius-card)] border border-white/10 bg-white/5 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {cert.org[language]}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-white">
                    {cert.title[language]}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Brainworks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
