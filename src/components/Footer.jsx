import React from "react";
import Image from "next/image";
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
    label: { ko: "본사", en: "HQ (Gwangju)" },
    address: {
      ko: "광주 동구 금남로 193-22 광주AI창업캠프 1호, 4층 403호",
      en: "403, 4F, Gwangju AI Startup Camp, 193-22 Geumnam-ro, Dong-gu, Gwangju",
    },
  },
  {
    label: { ko: "대구본사", en: "Daegu" },
    address: {
      ko: "대구광역시 동구 장등로 76, 대구콘텐츠기업지원센터 211호",
      en: "211, Daegu Contents Enterprise Support Center, 76 Jangdeung-ro, Dong-gu, Daegu",
    },
  },
  {
    label: { ko: "경북본사", en: "Gyeongbuk" },
    address: {
      ko: "경북 경산시 진량읍 대구대로 230, C동 102호, C-13",
      en: "C-13, 102 Bldg C, 230 Daegu-daero, Jinryang-eup, Gyeongsan-si, Gyeongsangbuk-do",
    },
  },
  {
    label: { ko: "경남본사", en: "Gyeongnam" },
    address: {
      ko: "경남 창원시 의창구 차룡로48번길 44, 스마트업타워 2층 알204호",
      en: "Smart-Up Tower 2F A204, 44 Charyong-ro 48-gil, Uichang-gu, Changwon-si, Gyeongsangnam-do",
    },
  },
  {
    label: { ko: "충남본사", en: "Chungnam" },
    address: {
      ko: "충남 아산시 배방읍 광장로 210, 202동 1층 a125호",
      en: "a125, 1F, Bldg 202, 210 Gwangjang-ro, Baebang-eup, Asan-si, Chungcheongnam-do",
    },
  },
];

export default function Footer() {
  const { language } = useLocale();
  const navigation = buildPublicNavigation(language);
  const groups = navigation.filter((item) => item.type === "group");
  const contact = navigation.find((item) => item.id === "contact");

  return (
    <footer className="bw-footer bg-ink-strong text-white">
      <div className="inner flex flex-col gap-16 py-24 pb-14">
        {/* 예전에는 사업장 다섯을 오른쪽 auto 칸에 한 줄로 세웠다. auto는
            주소가 필요한 만큼 폭을 가져가서 왼쪽 칸이 눌리고, 메뉴 글자가
            한 글자씩 끊겼다. 브랜드와 메뉴를 한 줄로 두고 사업장은 아래
            전체 폭에서 접히게 한다. */}
        <div className="grid gap-16 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div>
              <Image
                src="/images/회사로고.png"
                alt="브레인웍스"
                width={270}
                height={86}
                className="h-[52px] w-auto brightness-0 invert"
              />
            </div>
            <div className="space-y-1 text-sm text-white/70">
              <p>{language === "ko" ? "대표 강우현" : "CEO Woohyun (Austin) Kang"}</p>
              <p>Email austin@brainworks.co.kr</p>
              <p>Tel (+82) 010-6639-4084</p>
            </div>
          </div>

          <nav
            aria-label={language === "ko" ? "보조 메뉴" : "Footer navigation"}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            <h2 className="sr-only">
              {language === "ko" ? "사이트 링크" : "Site links"}
            </h2>
            {groups.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-white">
                  {group.label}
                </h3>
                <ul className="mt-1">
                  {group.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.href}
                        className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:text-white"
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
                <h3 className="text-sm font-semibold text-white">
                  {contact.label}
                </h3>
                <ul className="mt-1">
                  <li>
                    <Link
                      href={contact.href}
                      className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:text-white"
                    >
                      {contact.label}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:text-white"
                    >
                      {language === "ko"
                        ? "개인정보처리방침"
                        : "Privacy Policy"}
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </nav>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {offices.map((office) => (
            <div
              key={office.label.en}
              className="rounded-[var(--bw-radius-card)] border border-white/10 bg-white/5 p-4 lg:border-0 lg:bg-transparent lg:p-0"
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

        {certificationsData.length > 0 && (
          <section
            aria-label={certLabel[language]}
            className="border-t border-white/15 pt-8"
          >
            <h3 className="text-sm font-semibold text-white">
              {certLabel[language]}
            </h3>
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

        <p className="border-t border-white/15 pt-6 text-xs text-white/70">
          © {new Date().getFullYear()} Brainworks. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
