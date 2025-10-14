import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const quickLinks = [
  { href: '/', label: { ko: '홈', en: 'Home' } },
  { href: '/about', label: { ko: '회사소개', en: 'About' } },
  { href: '/services', label: { ko: 'AI 솔루션', en: 'AI Business Areas' } },
  { href: '/consulting', label: { ko: 'AI 컨설팅', en: 'AI Consulting' } },
  { href: '/education', label: { ko: 'AI 전문교육', en: 'AI Academy' } },
  { href: '/news', label: { ko: '소식', en: 'News' } },
  { href: '/contact', label: { ko: '문의하기', en: 'Contact' } },
];

const offices = [
  {
    label: { ko: '본사', en: 'HQ (Daegu)' },
    address: {
      ko: '대구광역시 동구 장등로 76, 대구콘텐츠기업지원센터 211호',
      en: '211, Daegu Contents Enterprise Support Center, 76 Jangdeung-ro, Dong-gu, Daegu',
    },
  },
  {
    label: { ko: '경북본사', en: 'North Gyeongsang' },
    address: {
      ko: '경북 경산시 진량읍 대구대로 230, C동 102호, C-13',
      en: 'C-13, 102 Bldg C, 230 Daegu-daero, Jinryang-eup, Gyeongsan-si, Gyeongbuk',
    },
  },
  {
    label: { ko: '경남본사', en: 'South Gyeongsang' },
    address: {
      ko: '경남 창원시 의창구 차룡로48번길 44, 스마트업타워 2층 알204호',
      en: 'Smart-Up Tower 2F A204, 44 Charyong-ro 48-gil, Uichang-gu, Changwon-si, Gyeongnam',
    },
  },
  {
    label: { ko: '충남본사', en: 'Chungnam' },
    address: {
      ko: '충남 아산시 배방읍 광장로 210, 202동 1층 a125호',
      en: 'a125, 1F, Bldg 202, 210 Gwangjang-ro, Baebang-eup, Asan-si, Chungnam',
    },
  },
  {
    label: { ko: '광주본사', en: 'Gwangju' },
    address: {
      ko: '광주 동구 금남로 193-22 광주AI창업캠프 1호, 4층 403호',
      en: '403, 4F, Gwangju AI Startup Camp, 193-22 Geumnam-ro, Dong-gu, Gwangju',
    },
  },
];

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,_1fr)_minmax(0,_0.6fr)]">
          <div className="space-y-6">
            <div>
              <span className="text-2xl font-semibold text-white">Brainworks</span>
              <p className="mt-3 text-sm text-slate-400">
                {language === 'ko'
                  ? '데이터와 AI로 고객의 혁신을 실현하는 파트너, 브레인웍스입니다.'
                  : 'Brainworks is your partner for turning data and AI into real business impact.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-sky-400 hover:text-white"
                >
                  {item.label[language]}
                </Link>
              ))}
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-slate-300">Email · austin@brainworks.co.kr</p>
              <p className="text-slate-300">Tel · +82-10-6639-4084</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {offices.map((office) => (
              <div key={office.label.en} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
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

        <div className="flex flex-col gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Brainworks. {language === 'ko' ? '모든 권리 보유.' : 'All rights reserved.'}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-200">{language === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}</Link>
            <Link href="/terms" className="hover:text-slate-200">{language === 'ko' ? '이용약관' : 'Terms'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
