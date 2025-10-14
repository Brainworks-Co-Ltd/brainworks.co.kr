import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  {
    key: 'overview',
    href: '/about',
    label: {
      ko: 'CEO 인사말',
      en: 'CEO Message',
    },
  },
  {
    key: 'history',
    href: '/about/history',
    label: {
      ko: '회사 연혁',
      en: 'Company History',
    },
  },
  {
    key: 'honors',
    href: '/about/honors',
    label: {
      ko: '수상 및 인증',
      en: 'Awards & Certifications',
    },
  },
];

export default function AboutSidebar({ active }) {
  const { language } = useLanguage();

  return (
    <nav className="lg:w-64">
      <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          {language === 'ko' ? '회사 소개' : 'About Brainworks'}
        </h2>
        <ul className="mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = item.key === active;
            const baseClasses =
              'block rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200';
            const activeClasses = isActive
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

            return (
              <li key={item.key}>
                <Link href={item.href} className={`${baseClasses} ${activeClasses}`}>
                  {item.label[language]}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
