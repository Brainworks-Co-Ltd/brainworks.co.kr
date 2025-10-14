import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedBusinessAreas } from '@/data/businessAreas';

const ROTATION_MS = 6000;

export default function Services() {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const localizedAreas = useMemo(() => getLocalizedBusinessAreas(language), [language]);
  const totalAreas = localizedAreas.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [language]);

  useEffect(() => {
    if (!totalAreas) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalAreas);
    }, ROTATION_MS);

    return () => clearTimeout(timer);
  }, [activeIndex, totalAreas]);

  if (!totalAreas) {
    return null;
  }

  const activeArea = localizedAreas[activeIndex % totalAreas];

  const handleSelect = (index) => {
    setActiveIndex(index);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + totalAreas) % totalAreas);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalAreas);
  };

  const getDotClasses = (isActive) => {
    const base = 'h-2.5 w-10 rounded-full transition ';
    return isActive ? base + 'bg-sky-500' : base + 'bg-slate-300 hover:bg-slate-400';
  };

  return (
    <section id="services" className="relative bg-slate-200 py-24 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-white to-slate-200" aria-hidden="true" />
      <div className="relative container mx-auto flex flex-col gap-12 px-4">
        <div className="mx-auto w-full max-w-5xl space-y-4 text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            {language === 'ko' ? '브레인웍스 사업 분야' : 'Brainworks Business Domains'}
          </p>
          <h2 className="text-4xl font-semibold md:text-5xl">
            {language === 'ko' ? '핵심 AI 사업 분야' : 'Core AI Business Domains'}
          </h2>
          <p className="text-lg text-slate-600">{activeArea.subtitle}</p>
        </div>

        <div className="grid place-items-center gap-10" aria-live="polite">
          <div className="group relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-3 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
              aria-label={language === 'ko' ? '이전 사업 분야 보기' : 'View previous business area'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/85 p-3 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
              aria-label={language === 'ko' ? '다음 사업 분야 보기' : 'View next business area'}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
            <div className="relative h-full w-full">
              <Image
                src={activeArea.heroImage}
                alt={`${activeArea.title} hero`}
                width={960}
                height={540}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-8">
              <div className="rounded-3xl bg-black/60 p-6 text-white shadow-[0_18px_45px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>{String(activeIndex + 1).padStart(2, '0')} / {String(totalAreas).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-4 text-3xl font-semibold">
                  {activeArea.title}
                </h3>
                <p className="mt-3 text-base text-white/90">
                  {activeArea.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {localizedAreas.map((area, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelect(index)}
                className={getDotClasses(isActive)}
                aria-label={
                  language === 'ko' ? `${area.title} 슬라이드 이동` : `Go to ${area.title} slide`
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
