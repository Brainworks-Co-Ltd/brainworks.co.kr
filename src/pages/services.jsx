import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedBusinessAreas } from '@/data/businessAreas';

export default function Services() {
  const { language } = useLanguage();
  const localizedAreas = useMemo(() => getLocalizedBusinessAreas(language), [language]);
  const [activeId, setActiveId] = useState(() => (localizedAreas[0]?.id ?? ''));

  useEffect(() => {
    if (localizedAreas.length > 0) {
      setActiveId(localizedAreas[0].id);
    }
  }, [localizedAreas]);

  const activeArea = localizedAreas.find((area) => area.id === activeId) ?? localizedAreas[0];

  const getTabClasses = (isActive) => {
    const base = 'whitespace-nowrap border-b-2 pb-3 text-base font-medium transition-colors duration-200 ';
    return isActive
      ? base + 'border-sky-500 text-sky-600'
      : base + 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800';
  };

  const solutionGridClasses =
    (activeArea?.id ?? '') === 'smartcity'
      ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3'
      : 'grid gap-6 md:grid-cols-2';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-sky-50 to-slate-100">
          <div className="absolute inset-y-0 right-[-40%] hidden rotate-6 rounded-full bg-sky-500/10 blur-3xl md:block" aria-hidden="true" />
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                {language === 'ko' ? '브레인웍스 AI 서비스' : 'Brainworks AI Services'}
              </p>
              <h1 className="text-4xl font-semibold md:text-5xl">
                {language === 'ko'
                  ? '고객 문제정의 기반 AI 솔루션'
                  : 'AI solutions grounded in real-world challenges'}
              </h1>
              <p className="text-lg text-slate-600">
                {language === 'ko'
                  ? '제조, 에이전트, 헬스케어, 스마트시티 분야에서 축적된 데이터와 현장 경험을 바탕 빠르게 도입 가능한 AI 서비스 제공'
                  : 'Brainworks delivers rapidly deployable AI services for manufacturing, agents, healthcare, and smart city operations, grounded in rich data and field experience.'}
              </p>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="container mx-auto px-4 py-20">
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-8 border-b border-slate-200 pb-4">
                {localizedAreas.map((area) => {
                  const isActive = area.id === (activeArea?.id ?? '');
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setActiveId(area.id)}
                      className={getTabClasses(isActive)}
                      aria-current={isActive ? 'true' : 'false'}
                    >
                      {area.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeArea && (
              <div className="mt-12 space-y-12">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_0.9fr)]">
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <Image
                      src={activeArea.heroImage}
                      alt={activeArea.title + ' overview'}
                      width={960}
                      height={540}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent p-8 text-white">
                      <h2 className="text-3xl font-semibold">{activeArea.title}</h2>
                      <p className="mt-3 text-base text-slate-100">{activeArea.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <div className="space-y-4">
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-700">
                        {language === 'ko' ? '분야 소개' : 'Domain Overview'}
                      </span>
                      <p className="text-lg text-slate-700">{activeArea.subtitle}</p>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {language === 'ko'
                          ? '데이터 인프라 구축부터 모델 개발, 운영까지 전 과정을 함께하며 비즈니스 가치를 만들어 갑니다.'
                          : 'We partner across data infrastructure, model development, and operations to turn AI into measurable business value.'}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>{language === 'ko' ? '주요 제공 가치' : 'Key Value Propositions'}</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {language === 'ko' ? (
                          <>
                            <li>데이터 기반 의사결정 가속화</li>
                            <li>현장 운영 최적화 및 자동화</li>
                            <li>고객 경험과 안전성 강화</li>
                          </>
                        ) : (
                          <>
                            <li>Accelerated, data-driven decisions</li>
                            <li>Optimised field operations and automation</li>
                            <li>Enhanced customer experience and safety</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold">
                    {language === 'ko' ? 'AI 솔루션' : 'AI Solution Line-up'}
                  </h3>
                  <div className={solutionGridClasses}>
                    {activeArea.solutions.map((solution) => (
                      <div
                        key={solution.id}
                        className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:border-sky-400/60 hover:shadow-2xl"
                      >
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
                          <Image
                            src={solution.image}
                            alt={solution.title + ' preview'}
                            fill
                            sizes="(min-width: 1280px) 320px, (min-width: 768px) 40vw, 90vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold">{solution.title}</p>
                          <p className="text-sm leading-relaxed text-slate-600">{solution.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-gradient-to-b from-white via-slate-100 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-100 via-white to-slate-100 p-12 text-center shadow-xl">
              <h3 className="text-3xl font-semibold">
                {language === 'ko' ? '맞춤형 AI 프로젝트를 함께 시작해보세요' : 'Let’s launch your tailored AI initiative'}
              </h3>
              <p className="mt-4 text-base text-slate-600">
                {language === 'ko'
                  ? '필요하신 사업 분야를 알려주시면 전문가가 최적의 도입 전략을 제안드립니다.'
                  : 'Share your business goals and our experts will craft the right adoption strategy.'}
              </p>
              <a
                href="/contact"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-sky-500 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                {language === 'ko' ? '문의하기' : 'Contact Us'}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
