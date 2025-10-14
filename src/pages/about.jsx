import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Honors from '@/components/Honors';
import { useLanguage } from '@/contexts/LanguageContext';

const historyItems = [
  {
    year: '2025',
    title: { ko: '글로벌 확장과 사업 고도화', en: 'Global Expansion and Business Scale-up' },
    summary: {
      ko: '국가 R&D 및 공공사업을 다수 수주하며 산업별 AI 솔루션 포트폴리오를 확장하고 글로벌 파트너십을 강화했습니다.',
      en: 'Secured multiple national R&D and public innovation programs while broadening industry-specific AI solutions and strengthening global partnerships.',
    },
    bullets: {
      ko: [
        '25.01. 한국항공우주산업주식회사 공급협력사 등록',
        '25.04. 브레인웍스 광주AI연구소, 경남 미래모빌리티 연구소, 경북 본사 창립',
        '25.04. 2024 창업진흥원 예비창업패키지 우수기업 선정 - 딥러닝 기반 CNN 공정 이상 감시 솔루션',
        '25.04. 경남 지역디지털혁신챌린지 사업 수행 - AI CNN 공정 진동이상 감지 플랫폼 개발',
        '25.05. 한국과학기술정보연구원(KISTI) 패밀리기업 선정',
        '25.05. 2025 창업진흥원 초기창업패키지 사업 선정 - 경량 LLM 기반 실시간 음성 통번역 솔루션',
        '25.05. 대구디지털혁신진흥원 SW인재양성사업 선정',
        '25.06. NIPA 지역디지털 글로벌 브릿지사업 1차 대구기업 대표 선정',
        '25.06. 인도네시아, 베트남 거점 기업과 다수 MOU 체결',
        '25.06. 대구디지털혁신진흥원 데이터가공사업 선정 - 3D Dental 이미지 데이터 가공',
        '25.06. 대구디지털혁신진흥원 에듀테크 콘텐츠 개발 사업 선정 - RAG+MCP 다국어 Q&A 솔루션',
        '25.06. 2025 대한민국리딩기업 스타트업대상 수상 (머니투데이)',
        '25.07. NIPA 지역디지털 글로벌 브릿지사업 2차 대구기업 대표 선정',
        '25.08. NIPA 지역디지털 글로벌 브릿지사업 3차 대구기업 대표 선정',
      ],
      en: [
        'Jan 2025: Registered as an authorized supplier for Korea Aerospace Industries (KAI).',
        'Apr 2025: Launched Gwangju AI Lab, Gyeongnam Future Mobility Lab, and the new Gyeongbuk headquarters.',
        'Apr 2025: Named an Excellent Startup in the 2024 K-Startup Pre-Startup Package with a CNN-based process anomaly monitoring solution.',
        'Apr 2025: Delivered the Gyeongnam Regional Digital Innovation Challenge with an AI CNN vibration anomaly detection platform.',
        'May 2025: Selected as a family company by the Korea Institute of Science and Technology Information (KISTI).',
        'May 2025: Won the 2025 K-Startup Initial Startup Package for a lightweight LLM real-time speech translation solution.',
        "May 2025: Chosen for DGDI's software talent cultivation program.",
        "Jun 2025: Represented Daegu firms in phase 1 of NIPA's Regional Digital Global Bridge initiative.",
        'Jun 2025: Signed multiple MOUs with partner companies in Indonesia and Vietnam.',
        "Jun 2025: Awarded DGDI's data processing project for 3D dental image datasets.",
        "Jun 2025: Won DGDI's edtech content program with an RAG+MCP multilingual Q&A solution.",
        'Jun 2025: Received the 2025 Korea Leading Company Startup Award (MoneyToday).',
        "Jul 2025: Represented Daegu firms in phase 2 of NIPA's Regional Digital Global Bridge initiative.",
        "Aug 2025: Represented Daegu firms in phase 3 of NIPA's Regional Digital Global Bridge initiative.",
      ],
    },
  },
  {
    year: '2024',
    title: { ko: '법인 설립과 제조 AI 고도화', en: 'Incorporation and Manufacturing AI Advances' },
    summary: {
      ko: '법인 전환과 동시에 제조 공정 AI 솔루션을 상용화하고 국내외 거점 확대를 추진했습니다.',
      en: 'Transitioned into a corporation, commercialised manufacturing AI suites, and expanded our domestic and global footprint.',
    },
    bullets: {
      ko: [
        '24.05. 브레인웍스 법인 설립',
        '24.05. AI 공정 수율 예측 및 공정 탐지 모델 개발',
        '24.05. AI 공정 수율 예측 및 공정 탐지 솔루션 개발',
        '24.09. AI VAE 기반 양불 판정 솔루션 개발',
        '24.09. 브레인웍스 충남 지사 설립',
        '24.10. 미국 조지아 주립대학교와 MOU 체결',
      ],
      en: [
        'May 2024: Incorporated Brainworks as a legal entity.',
        'May 2024: Built AI models for process yield prediction and anomaly detection.',
        'May 2024: Delivered full AI solutions for process yield prediction and fault detection.',
        'Sep 2024: Developed a VAE-based quality inspection solution.',
        'Sep 2024: Opened the Brainworks Chungnam branch office.',
        'Oct 2024: Signed an MOU with Georgia State University, USA.',
      ],
    },
  },
  {
    year: '2023',
    title: { ko: '초기 역량 구축', en: 'Laying the Foundations' },
    summary: {
      ko: '데이터 기반 기술 역량을 집중 강화하며 환경 분석 AI 솔루션의 기반을 다졌습니다.',
      en: 'Focused on building data-driven capabilities and laid the groundwork for environmental analytics solutions.',
    },
    bullets: {
      ko: [
        '23.09. Startup-Digup 프로그램 선정',
        '23.10. AI 머신러닝 기반 환경 분석 모델 개발',
        '23.12. AI 환경 분석 솔루션 개발',
      ],
      en: [
        'Sep 2023: Selected for the Startup-Digup program.',
        'Oct 2023: Developed an AI machine-learning environmental analysis model.',
        'Dec 2023: Released an AI-powered environmental analysis solution.',
      ],
    },
  },
];

const accentPalette = [
  'from-sky-500 via-blue-500 to-sky-400',
  'from-violet-500 via-indigo-500 to-blue-500',
  'from-emerald-500 via-teal-500 to-sky-400',
  'from-amber-500 via-orange-500 to-rose-400',
];

export default function About() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white py-20">
        <div className="container mx-auto px-4 mt-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 text-center mb-16 md:text-5xl">
              {language === 'ko' ? 'CEO 메시지' : 'CEO Message'}
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed text-left">
              <p>
                {language === 'ko'
                  ? '브레인웍스는 데이터와 AI가 만들어 내는 가치로 고객의 변화를 이끌어가는 파트너입니다. 우리는 기술이 아니라 문제 해결을 중심에 두고, 고객의 현장 속에서 답을 찾습니다.'
                  : "Brainworks is a partner that drives client transformation through the value created by data and AI. We focus on solving real problems first and discover answers directly from our clients' businesses."}
              </p>
              <p>
                {language === 'ko'
                  ? '끊임없이 배우고 실험하며 가장 믿을 수 있는 AI 동반자가 되겠습니다. 고객과 함께 성장하는 것이 우리의 존재 이유입니다.'
                  : 'We keep learning and experimenting to become the most trusted AI companion. Growing together with our clients is the reason we exist.'}
              </p>
            </div>
            <div className="mt-12 flex flex-col items-end space-y-4">
              <img
                src="/images/대표사진.png"
                alt={language === 'ko' ? 'CEO 사진' : 'CEO photo'}
                className="h-60 object-contain"
              />
              <p className="text-xl font-semibold text-gray-900 text-right">
                {language === 'ko' ? '브레인웍스 CEO 강우현' : 'Austin Kang, CEO of Brainworks'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Honors />

      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <span className="text-sm uppercase tracking-[0.3em] text-sky-500">
              {language === 'ko' ? '회사 연혁' : 'Timeline'}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              {language === 'ko' ? '브레인웍스의 발자취' : 'Milestones of Brainworks'}
            </h2>
          </div>

          <div className="mt-12 space-y-6">
            {historyItems.map((item, index) => {
              const accent = accentPalette[index % accentPalette.length];
              return (
                <article
                  key={item.year}
                  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={'absolute inset-x-0 top-0 h-1 bg-gradient-to-r ' + accent}
                    aria-hidden="true"
                  />
                  <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,_120px)_1fr] md:p-8">
                    <div className="flex flex-col gap-3">
                      <span className="text-3xl font-semibold text-slate-900">{item.year}</span>
                    </div>
                    <div className="space-y-4">
                      <ul className="space-y-3 text-sm text-slate-700">
                        {item.bullets[language].map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span
                              className={'mt-1 inline-flex h-1.5 w-6 rounded-full bg-gradient-to-r ' + accent}
                              aria-hidden="true"
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}








