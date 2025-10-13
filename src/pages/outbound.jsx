import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  ko: {
    heroBadge: 'Global Program',
    heroTitle: '글로벌 프로그램',
    heroSubtitle:
      '해외 비즈니스 네트워크 구축과 글로벌 확장, 글로벌 AI 전문 교육을 지원하는 풀 패키지 프로그램',
    ctaPrimary: '프로그램 상담 신청',
    ctaSecondary: '문의하기',
    sectionTitle: '주요 프로그램',
    sectionSubtitle: '현지 파트너 매칭부터 글로벌 전시회, 연수까지 한 번에 준비하세요.',
    aiSectionTitle: '글로벌 AI 전문 교육 프로그램',
    aiSectionSubtitle: '실전 중심의 해커톤, 인턴십, 교육 과정을 통해 글로벌 AI 인재를 양성합니다.',
    contactTitle: '해외 진출 계획을 알려주세요',
    contactSubtitle:
      '희망 지역과 목표를 공유해 주시면 맞춤형 글로벌 엑셀러레이션 로드맵과 제휴 네트워크를 제안드립니다.',
    contactCta: '엑셀러레이터 문의하기',
  },
  en: {
    heroBadge: 'Global Program',
    heroTitle: 'Global Program',
    heroSubtitle:
      'A full-service accelerator that secures overseas buyers and accelerates your global expansion, supporting global AI education.',
    ctaPrimary: 'Request Programme Consultation',
    ctaSecondary: 'Download Brochure',
    sectionTitle: 'Programme Components',
    sectionSubtitle: 'From business matching to exhibitions and executive training, everything is covered.',
    aiSectionTitle: 'Global AI Professional Programmes',
    aiSectionSubtitle: 'Develop global-ready AI talent through hackathons, internships, and expert-led courses.',
    contactTitle: 'Tell Us Your Global Plan',
    contactSubtitle:
      'Share your target regions and objectives so we can craft a tailored accelerator roadmap and introduce partners.',
    contactCta: 'Contact Accelerator Team',
  },
};

const programs = [
  {
    id: 'business-matching',
    badge: { ko: '1대1 비즈니스 매칭', en: '1:1 Business Matching' },
    title: {
      ko: '해외 현지 기업과의 1:1 비즈니스 매칭',
      en: 'Personalised Matching with Overseas Buyers',
    },
    description: {
      ko: '인도네시아, 베트남, 우즈베키스탄 등 주요 신흥 시장의 기업과 연결하여 신규 바이어 확보와 파트너십 발굴을 지원합니다.',
      en: 'Connect with vetted companies in Indonesia, Vietnam, Uzbekistan, and other growth markets to secure new buyers and partners.',
    },
    bullets: {
      ko: [
        '현지 시장 분석과 타겟 바이어 리스트업',
        '비즈니스 미팅 일정 조율 및 통역 지원',
        '사후 후속 협상 및 계약 체결 컨설팅',
      ],
      en: [
        'Local market intelligence and curated buyer shortlists',
        'Meeting scheduling, facilitation, and interpretation support',
        'Post-meeting negotiation and contract advisory',
      ],
    },
  },
  {
    id: 'exhibition-participation',
    badge: { ko: '글로벌 전시회 참여', en: 'Global Exhibition Participation' },
    title: {
      ko: '글로벌 전시회 부스 운영 및 홍보',
      en: 'End-to-end Support for Global Exhibitions',
    },
    description: {
      ko: '베트남 ICTCOMM, 일본 IT WEEK, 미국 CES, 스페인 MWC 등 글로벌 전시회 참가를 위한 부스 설계와 홍보를 담당합니다.',
      en: 'Handle booth design and marketing for shows such as Vietnam ICTCOMM, Japan IT WEEK, CES, and MWC.',
    },
    bullets: {
      ko: [
        '전시회 선정과 참가 신청 대행',
        '부스 설계·시공, 프로모션 콘텐츠 제작',
        '현장 운영 스태프 및 실시간 리드 관리',
      ],
      en: [
        'Recommend events and manage registration logistics',
        'Design and build booths, create promotional assets',
        'On-site staffing and real-time lead capture management',
      ],
    },
  },
  {
    id: 'exhibition-scouting',
    badge: { ko: '글로벌 전시회 탐방', en: 'Global Exhibition Scouting' },
    title: {
      ko: '바이어 탐색형 글로벌 전시회 탐방',
      en: 'Scouting Tours for New Buyers & Partners',
    },
    description: {
      ko: '전시회 현장을 탐방하며 바이어와 파트너를 발굴할 수 있도록 이동, 숙박, 네트워킹 프로그램을 제공합니다.',
      en: 'Discover buyers and partners through curated exhibition tours covering travel, lodging, and networking.',
    },
    bullets: {
      ko: [
        '탐방 일정, 숙박, 이동편 기획 및 운영',
        '비즈니스 매칭과 네트워킹 세션 구성',
        '시장 트렌드 브리핑 및 현장 통역 지원',
      ],
      en: [
        'Plan and manage travel, accommodation, and agenda',
        'Arrange business matching and networking sessions',
        'Provide trend briefings and on-site interpretation',
      ],
    },
  },
  {
    id: 'global-training',
    badge: { ko: '글로벌 연수', en: 'Global Training' },
    title: {
      ko: '해외 연수로 글로벌 역량 강화',
      en: 'Executive Programmes & Immersion Trips',
    },
    description: {
      ko: '미국과 베트남 주요 대학 및 기업과 연계한 연수 프로그램으로 글로벌 역량을 강화합니다.',
      en: 'Strengthen global capability through immersion programmes with universities and companies across the US and Vietnam.',
    },
    bullets: {
      ko: [
        '기업 맞춤형 글로벌 역량 진단과 커리큘럼 설계',
        '대학·기업 현장 연계 세미나 및 워크숍',
        '연수 이후 글로벌 전략 실행 코칭',
      ],
      en: [
        'Assess capability gaps and build tailored curricula',
        'Deliver seminars and workshops with partner universities and enterprises',
        'Provide post-programme coaching to execute global strategies',
      ],
    },
  },
];

const aiPrograms = [
  {
    id: 'global-hackathon',
    title: { ko: '글로벌 해커톤', en: 'Global Hackathon' },
    description: {
      ko: '다국적 팀 빌딩과 글로벌 멘토단의 피드백으로 실전 문제를 해결하는 집중 프로그램',
      en: 'An immersive hackathon where multinational teams solve real briefs with guidance from global mentors.',
    },
    bullets: {
      ko: [
        '3~5인 다국적 팀 구성 및 문제 정의 워크숍',
        '글로벌 멘토·투자자 피드백과 데모 세션',
        '우수 팀 글로벌 데모데이 참가 및 파트너 연계',
      ],
      en: [
        'Form 3-5 member cross-border teams with facilitated problem framing',
        'Daily feedback from global mentors and investors',
        'Top teams invited to international demo days and partner intros',
      ],
    },
  },
  {
    id: 'global-ai-internship',
    title: { ko: '글로벌 AI 인턴십', en: 'Global AI Internship' },
    description: {
      ko: '해외 파트너 기업과 연계한 8~12주 프로젝트 인턴십으로 현장 실무 역량 강화',
      en: 'An 8-12 week placement with overseas partners delivering hands-on AI projects.',
    },
    bullets: {
      ko: [
        '도메인 맞춤형 프로젝트 매칭과 온보딩',
        '현지 멘토와 주간 성과 리뷰·코칭',
        '귀국 후 포트폴리오 및 커리어 상담 제공',
      ],
      en: [
        'Tailored project matching and onboarding support',
        'Weekly performance reviews with on-site mentors',
        'Post-programme portfolio and career coaching',
      ],
    },
  },
  {
    id: 'global-ai-education',
    title: { ko: '글로벌 AI 교육', en: 'Global AI Education' },
    description: {
      ko: '대학·기관 연계형 커리큘럼으로 최신 AI 기술과 글로벌 사례 학습',
      en: 'Modular courses for universities and organisations covering advanced AI and global best practices.',
    },
    bullets: {
      ko: [
        'LLM·생성형 AI·윤리 등 최신 트렌드 AI 심화 모듈',
        '해외 대학 연계 AI 전문 교육 및 인증',
        '수료생 글로벌 커뮤니티 및 후속 프로젝트 연계',
      ],
      en: [
        'Deep-dive modules on LLMs, generative AI, ethics, and deployment',
        'Case studies anchored in global enterprise implementations',
        'Alumni community access with follow-on project opportunities',
      ],
    },
  },
];

export default function Outbound() {
  const { language } = useLanguage();
  const t = copy[language];

  const networkMapSrc = language === 'ko' ? '/images/outbound/맵.png' : '/images/outbound/map.png';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-24 pb-16">
        <section className="relative overflow-hidden bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 text-white">
          <div className="absolute inset-y-0 right-[-20%] h-full w-1/2 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-5xl px-6 py-24">
            <span className="text-sm uppercase tracking-[0.3em] text-white/70">{t.heroBadge}</span>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{t.heroTitle}</h1>
            <p className="mt-4 max-w-3xl text-lg text-white/80">{t.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-sky-700 transition hover:bg-slate-100"
              >
                {t.ctaPrimary}
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-10 px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {language === 'ko' ? '글로벌 엑셀레이터 프로그램' : 'Global Accelerator Program'}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              {language === 'ko'
                ? '전세계 12개국 이상의 파트너와 연결된 글로벌 엑셀러레이터 네트워크'
                : 'We operate an accelerator network connected to partners across more than 12 countries.'}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-90 w-full bg-slate-100 md:h-[28rem]">
              <img
                src={networkMapSrc}
                alt={language === 'ko' ? '글로벌 파트너 네트워크 지도' : 'Global partner network map'}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-4">
              {[
                { key: 'usa', label: 'U.S.A.', count: 1 },
                { key: 'qatar', label: 'Qatar', count: 1 },
                { key: 'vietnam', label: 'Vietnam', count: 4 },
                { key: 'poland', label: 'Poland', count: 1 },
                { key: 'indonesia', label: 'Indonesia', count: 3 },
                { key: 'australia', label: 'Australia', count: 1 },
                { key: 'uzbekistan', label: 'Uzbekistan', count: 8 },
                { key: 'singapore', label: 'Singapore', count: 1 },
              ].map((country) => (
                <div
                  key={country.key}
                  className="flex flex-col items-start gap-1 rounded-2xl bg-slate-900 px-4 py-3 text-white"
                >
                  <span className="text-2xl font-semibold">{country.count}</span>
                  <span className="text-sm uppercase tracking-[0.2em]">{country.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {[
              {
                key: 'education',
                title: language === 'ko' ? 'AI 교육 협력' : 'AI Education',
                lines: [
                  language === 'ko' ? '국내 대학 4곳, 미국 대학 1곳' : '4 domestic universities, 1 U.S. university',
                  language === 'ko' ? '베트남 대학 1곳, 우즈베키스탄 기업 1곳' : '1 Vietnamese university, 1 Uzbek company',
                  language === 'ko' ? '카타르 기업 1곳' : '1 Qatari company',
                ],
              },
              {
                key: 'manufacturing',
                title: language === 'ko' ? '제조 AI' : 'Manufacturing AI',
                lines: [
                  language === 'ko' ? '인도네시아 3개 기업, 베트남 3개 기업' : '3 Indonesian companies, 3 Vietnamese companies',
                  language === 'ko' ? '우즈베키스탄 7개 기업, 폴란드 1개 기업' : '7 Uzbek firms, 1 Polish firm',
                  language === 'ko' ? '싱가포르 1개 기업' : '1 Singaporean company',
                ],
              },
              {
                key: 'agent',
                title: language === 'ko' ? 'sLLM 기반 AI 에이전트' : 'sLLM Based AI Agent',
                lines: [
                  language === 'ko' ? '국내 2개 기업' : '2 domestic companies',
                  language === 'ko' ? '카타르 1개 기업' : '1 company in Qatar',
                ],
              },
              {
                key: 'smartcity',
                title: language === 'ko' ? '스마트시티 & 안전 AI' : 'SmartCity & Safety AI',
                lines: [
                  language === 'ko' ? '국내 1개 기업' : '1 domestic company',
                  language === 'ko' ? '호주 1개 기업' : '1 company in Australia',
                ],
              },
              {
                key: 'healthcare',
                title: language === 'ko' ? '헬스케어 & 바이오 AI' : 'Healthcare & Bio AI',
                lines: [
                  language === 'ko' ? '국내 2개 기업' : '2 domestic companies',
                ],
              },
            ].map((category) => (
              <div key={category.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{category.title}</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {category.lines.map((line, idx) => (
                    <li key={[category.key, idx].join('-')}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-10 px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {programs.map((program, index) => (
              <article
                key={program.id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                  <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" />
                  <span>{program.badge[language]}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{program.title[language]}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{program.description[language]}</p>
                <ul className="mt-auto space-y-2 text-sm text-slate-700">
                  {program.bullets[language].map((bullet) => (
                    <li key={[program.id, bullet].join('-')} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{t.aiSectionTitle}</h2>
            <p className="mt-3 text-sm text-slate-500">{t.aiSectionSubtitle}</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {aiPrograms.map((program) => (
              <article
                key={program.id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-semibold text-slate-900">{program.title[language]}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{program.description[language]}</p>
                <ul className="mt-auto space-y-2 text-sm text-slate-700">
                  {program.bullets[language].map((bullet) => (
                    <li key={[program.id, bullet].join('-')} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-5xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">{t.contactTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.contactSubtitle}</p>
            <a
              href="/contact"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              {t.contactCta}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
