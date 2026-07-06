import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Megaphone, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function translate(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.ko ?? value.en ?? '';
}

function isPopupActive(popup) {
  const now = new Date();
  const startsAt = popup.startsAt ? new Date(popup.startsAt) : null;
  const endsAt = popup.endsAt ? new Date(`${popup.endsAt}T23:59:59`) : null;

  if (startsAt && now < startsAt) return false;
  if (endsAt && now > endsAt) return false;
  return true;
}

export default function BidNoticePopup({ popups = [] }) {
  const { language } = useLanguage();
  const activePopup = useMemo(() => popups.find(isPopupActive), [popups]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!activePopup || typeof window === 'undefined') {
      return;
    }

    setIsVisible(window.localStorage.getItem(activePopup.dismissKey) !== 'dismissed');
  }, [activePopup]);

  if (!activePopup || !isVisible) {
    return null;
  }

  const handleClose = () => {
    window.localStorage.setItem(activePopup.dismissKey, 'dismissed');
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] px-4 sm:bottom-6">
      <div className="mx-auto max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Megaphone className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-blue-600">
              {translate(activePopup.title, language)}
            </p>
            <p className="mt-2 text-base font-semibold leading-snug text-slate-950">
              {translate(activePopup.message, language)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={activePopup.href}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {translate(activePopup.ctaLabel, language)}
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {language === 'ko' ? '닫기' : 'Dismiss'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={language === 'ko' ? '팝업 닫기' : 'Close popup'}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
