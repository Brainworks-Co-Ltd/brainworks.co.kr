import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedBusinessAreas } from '@/data/businessAreas';

const ROTATION_MS = 8000;

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
    <section id="services" className="relative bg-gradient-to-b from-white via-slate-50 to-white py-24 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50 to-white" aria-hidden="true" />
      <div className="relative container mx-auto flex flex-col gap-12 px-4">
        <div className="space-y-4 text-center md:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            {language === 'ko' ? '브레인웍스 사업 영역' : 'Brainworks Business Domains'}
          </p>
          <h2 className="text-4xl font-semibold md:text-5xl">
            {language === 'ko' ? 'AI가 이끄는 핵심 사업 분야' : 'Core Business Areas Powered by AI'}
          </h2>
          <p className="text-lg text-slate-600">{activeArea.subtitle}</p>
        </div>

        <div
          className="grid gap-10 lg:grid-cols-[minmax(0,_1.2fr)_minmax(0,_0.8fr)]"
          aria-live="polite"
        >
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
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
                alt={activeArea.title + ' hero'}
                width={960}
                height={540}
                className="h-full w-full object-cover"
                priority
              />
              </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent p-8 text-white">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>
                  {String(activeIndex + 1).padStart(2, '0')} / {String(totalAreas).padStart(2, '0')}
                </span>
                <span>{language === 'ko' ? '자동 슬라이드' : 'Auto rotating'}</span>
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">{activeArea.title}</h3>
              <p className="mt-3 text-base text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">{activeArea.description}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-slate-900">
                {language === 'ko' ? '대표 솔루션' : 'Representative Solutions'}
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                {language === 'ko'
                  ? '분야별 주요 솔루션을 통해 즉시 도입 가능한 AI 가치를 확인하세요.'
                  : 'Discover deployable AI assets tailored to each business domain.'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeArea.solutions.map((solution) => (
                <div
                  key={solution.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-lg"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-44 lg:h-48">
                    <Image
                      src={solution.image}
                      alt={solution.title + ' thumbnail'}
                      fill
                      sizes="(min-width: 1024px) 260px, 80vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">{solution.title}</p>
                    <p className="text-xs text-slate-600">{solution.description}</p>
                  </div>
                </div>
              ))}
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
                  language === 'ko'
                    ? area.title + ' 슬라이드로 이동'
                    : 'Go to ' + area.title + ' slide'
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
