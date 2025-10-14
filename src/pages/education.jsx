import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const processSteps = [
  {
    id: 'specialised-training',
    stage: {
      ko: '전문 심화 교육',
      en: 'Specialised Training',
    },
    focus: {
      ko: 'AI/AX 전문 교육',
      en: 'AI/AX Specialisation',
    },
    summary: {
      ko: 'AI/AX 기반 데이터·엔지니어링·보안·로봇·IoT 응용 역량 향상 교육',
      en: 'Training to enhance applied skills in AI/AX-based data, engineering, security, robotics, and IoT',
    },
    modules: {
      ko: ['AI', '빅데이터', '프론트엔드', '백엔드', '모빌리티', '로보틱스', 'AIoT', '사이버보안'],
      en: ['AI', 'Big Data', 'Front-end', 'Back-end', 'Mobility', 'Robotics', 'AIoT', 'Cybersecurity'],
    },
    highlights: {
      ko: [
        'AI 산업 현장 전문가가 실무 중심으로 진행하는 강의',
        '분야별 특화 커리큘럼으로 단계별 핵심 기술 습득',
      ],
      en: [
        'Practitioner-led lectures anchored in real industry needs.',
        'Role-specific curricula to build core skills step by step.',
      ],
    },
    image: {
      src: '/images/education/AI전문교육.jpg',
      alt: {
        ko: '전문 교육 워크숍 사진',
        en: 'Specialised training workshop photo',
      },
    },
  },
  {
    id: 'mentoring-hackathon',
    stage: {
      ko: '사전 멘토링 + 해커톤',
      en: 'Pre-mentoring & Hackathon',
    },
    focus: {
      ko: '실전 수행',
      en: 'Practical Execution',
    },
    summary: {
      ko: '멘토링과 해커톤 스프린트로 팀 기반 문제 해결과 프로젝트 실행력 강화',
      en: 'Mentoring and hackathon sprints sharpen team problem-solving and project execution.',
    },
    modules: {
      ko: ['사전 멘토링', '해커톤 본선', '상주 멘토', '팀 맞춤 피드백', '실제 비즈니스 과제'],
      en: ['Pre-mentoring', 'Hackathon Finals', 'On-site Mentors', 'Team-tailored Feedback', 'Real-world Challenges'],
    },
    highlights: {
      ko: [
        '밀착 코칭으로 산출물 완성도 향상',
        '기업 실무 과제를 해결하며 실전 대응력 확보',
      ],
      en: [
        'Close coaching that elevates deliverable quality before the finals.',
        'Solve actual company challenges to build practical readiness.',
      ],
    },
    image: {
      src: '/images/education/AI해커톤.jpg',
      alt: {
        ko: '해커톤 멘토링 현장 사진',
        en: 'Mentoring during hackathon photo',
      },
    },
  },
  {
    id: 'global-internship',
    stage: {
      ko: '글로벌 연수 & 인턴십',
      en: 'Global Training & Internships',
    },
    focus: {
      ko: '글로벌 경쟁력',
      en: 'Global Competency',
    },
    summary: {
      ko: '국내외 연수와 인턴십으로 글로벌 역량 확보',
      en: 'Connect domestic and overseas training with internships to build global credentials and experience.',
    },
    modules: {
      ko: ['해외 연수', '국제 자격', '미국 인턴십', '국내 인턴십 매칭', '미국 대학 수료증', '글로벌 사업 경험'],
      en: ['Overseas Training', 'International Certifications', 'US Internship', 'Domestic Internship Matching', 'US University Certificate', 'Global Expansion Experience'],
    },
    highlights: {
      ko: [
        '미국 조지아 주립대학교 등 해외 기관과의 고급 커리큘럼',
        '국내·해외 인턴십 연계로 실무 경험과 네트워크 확대',
      ],
      en: [
        'Advanced curricula with partners such as Georgia State University.',
        'Link domestic and international internships to broaden experience and networks.',
      ],
    },
    image: {
      src: '/images/education/Global.png',
      alt: {
        ko: '해외 인턴십 경험 사진',
        en: 'Global internship experience photo',
      },
    },
  },
  {
    id: 'portfolio-workshop',
    stage: {
      ko: '커리어 포트폴리오 워크숍',
      en: 'Career Portfolio Workshop',
    },
    focus: {
      ko: '취업 준비',
      en: 'Career Readiness',
    },
    summary: {
      ko: '실습 결과를 Git, 데모, 개인 브랜딩으로 구성해 시장 지향형 포트폴리오 완성',
      en: 'Organises outcomes into a market-ready portfolio with Git deployments, demos, and personal branding.',
    },
    modules: {
      ko: ['최종 리뷰', '맞춤 포트폴리오', '온라인 퍼블리싱', 'Git 전달', '개인 피치', '커리어 역량'],
      en: ['Comprehensive Review', 'Tailored Portfolio', 'Online Publishing', 'Git-based Delivery', 'Personal Pitch', 'Career Capability'],
    },
    highlights: {
      ko: [
        '목표 직무에 맞춘 프로젝트 스토리 정리',
        '기업이 요구하는 증빙과 스토리텔링으로 경쟁력 강화',
      ],
      en: [
        'Align every project story to target roles.',
        'Strengthen competitiveness with evidence and storytelling companies expect.',
      ],
    },
    image: {
      src: '/images/education/AI포트폴리오.jpg',
      alt: {
        ko: '포트폴리오 피드백 워크숍 사진',
        en: 'Portfolio feedback workshop photo',
      },
    },
  },
  {
    id: 'interview-lab',
    stage: {
      ko: '모의 채용 랩 & 기술 면접',
      en: 'Mock Hiring Lab & Technical Interviews',
    },
    focus: {
      ko: '면접 역량',
      en: 'Interview Mastery',
    },
    summary: {
      ko: '직무별 과제와 면접 리허설로 곧바로 활용 가능한 전략 완성',
      en: 'Rehearse role-specific tasks and interviews to produce immediately usable strategies.',
    },
    modules: {
      ko: ['경력기술서 작성', '모의 면접 실습', '기술 인터뷰', '면접 스킬 랩', '커리어 전략 코칭'],
      en: ['Career-ready CV', 'Mock Interview Practice', 'Technical Interviews', 'Interview Techniques', 'Career Strategy Coaching'],
    },
    highlights: {
      ko: [
        '성과 중심 이력서와 자기소개서로 브랜딩 완성',
        '현직 면접관 피드백으로 실전 감각 향상',
      ],
      en: [
        'Complete personal branding with accomplishment-driven CVs.',
        'Improve performance through feedback from real interviewers.',
      ],
    },
    image: {
      src: '/images/education/AI면접.jpg',
      alt: {
        ko: '모의 면접 진행 사진',
        en: 'Mock interview practice photo',
      },
    },
  },
];

const generativeAIChips = {
  ko: ['이틀 집중 과정', '직무 맞춤 사례', '프로젝트 피드백', '문서 자동화 실습'],
  en: ['Two-day intensive', 'Role-based scenarios', 'Project feedback', 'Document automation labs'],
};

const generativeAITracks = [
  {
    id: 'foundations',
    title: {
      ko: '생성형 AI 기초',
      en: 'GenAI Foundations & Ethics',
    },
    description: {
      ko: 'AI 개념과 최신 트렌드, 공공·기업 활용 방안 교육',
      en: 'Covers AI fundamentals, current trends, and safe adoption principles for public and enterprise teams.',
    },
    points: {
      ko: [
        'AI 발전 흐름과 주요 활용 사례 점검',
        '조직에서 생성형 AI 도입 영역 및 활용 방안',
        '조직 도입을 위한 필수 정책과 설정 실습',
      ],
      en: [
        'Review GenAI evolution alongside practical success stories.',
        'Draft an ethics and safety checklist using real misuse cases.',
        'Practise the baseline policies and settings for internal rollout.',
      ],
    },
  },
  {
    id: 'prompt-labs',
    title: {
      ko: '직무별 프롬프트 설계',
      en: 'Prompt Design for Everyday Tasks',
    },
    description: {
      ko: '팀 문서를 활용해 Before & After 중심으로 프롬프트 개선',
      en: 'Refine prompts with your team’s documents using a before-and-after approach.',
    },
    points: {
      ko: [
        '프롬프트 리팩토링으로 응답 품질 향상',
        '기획·홍보·민원·교육 등 역할별 시나리오 작성',
        '즉시 활용 가능한 프롬프트 카드와 체크리스트 제작',
      ],
      en: [
        'Lift answer quality through prompt refactoring drills.',
        'Create role-based scenarios for planning, comms, support, and education teams.',
        'Produce reusable prompt cards and validation checklists.',
      ],
    },
  },
  {
    id: 'workflow-automation',
    title: {
      ko: '생성형 AI 업무 활용',
      en: 'Gen AI Workflow Automation',
    },
    description: {
      ko: '문서 작성와 톤 변환, 협업 도구 연동까지 실무 위주 교육',
      en: 'Focuses on document automation, tone adjustments, and integrations with everyday collaboration tools.',
    },
    points: {
      ko: [
        '보고서·기안·FAQ 등 반복 문서 작성 실습',
        '정중/간결 등 톤·형식 변환으로 메시지 다듬기',
        'Google Workspace 등 협업 플랫폼과 연동 체험',
      ],
      en: [
        'Automate recurring documents such as reports, memos, and FAQs.',
        'Polish messaging by switching tone and format on demand.',
        'Connect ChatGPT with Google Workspace and other collaboration platforms.',
      ],
    },
  },
  {
    id: 'project-application',
    title: {
      ko: '프로젝트 적용 & 피드백',
      en: 'Applied Project & Feedback',
    },
    description: {
      ko: '팀 과제를 선정해 문제 정의부터 보고서·발표 자료까지 완성하고 피드백 확보',
      en: 'Select a team project, move from problem framing to final deliverables, and receive expert feedback.',
    },
    points: {
      ko: [
        '과제 선정 후 문제 정의 → 해결안 설계 워크숍',
        '제안서·보고서·발표 자료 구성 및 작성',
        '전문 코치 피드백으로 개선 포인트 확인',
      ],
      en: [
        'Workshop the journey from problem framing to solution design.',
        'Build proposals, reports, and presentation assets.',
        'Review outcomes with targeted coaching feedback.',
      ],
    },
  },
];



const educationClients = [
  { id: 'jeonnamtp', name: '전남tp', logo: '/images/education/전남tp.png'},
  { id: 'chungnam', name: 'Chungnam University', logo: '/images/education/충남대.png' },
  { id: 'sch', name: 'sch', logo: '/images/education/순천향대학교.jpg' },
  { id: 'kongju', name: 'kongju', logo: '/images/education/공주대.png' },
  { id: 'kosme', name: 'kosme', logo: '/images/education/중진공.png' },
  { id: 'katech', name: 'katech', logo: '/images/education/한자연.svg' },
];



const supportPillars = [
  {
    id: 'mentors',
    title: {
      ko: '전담 멘토 & 커뮤니티',
      en: 'Dedicated Mentors & Community',
    },
    description: {
      ko: '분야별 실무 멘토가 학습 설계, 프로젝트 리뷰, 커리어 코칭을 지원합니다.',
      en: 'Mentors guide learning plans, project reviews, and career coaching at every stage.',
    },
    points: {
      ko: ['1:1 정기 코칭', '상시 Q&A 커뮤니티 운영'],
      en: ['Regular one-on-one coaching', 'Active online Q&A community'],
    },
  },
  {
    id: 'projects',
    title: {
      ko: '현장 프로젝트 운영',
      en: 'Real-world Project Delivery',
    },
    description: {
      ko: '기업 실무 데이터를 기반으로 기획부터 배포·검증까지 단계별 프로젝트',
      en: 'Handle projects end to end from data collection to deployment and validation.',
    },
    points: {
      ko: ['산업 파트너와 공동 설계', '실무 검증 리포트 제공'],
      en: ['Co-designed with industry partners', 'Practitioner-led quality reviews'],
    },
  },
  {
    id: 'career',
    title: {
      ko: '기업 채용 연계 프로그램',
      en: 'Career Transition Support',
    },
    description: {
      ko: '포트폴리오, 면접, 인턴십을 연결해 채용 전환까지 연계하는 교육 프로그램',
      en: 'Connect portfolio building, interview prep, and internships to convert outcomes into offers.',
    },
    points: {
      ko: ['기업 네트워킹 데이', '국내·해외 인턴십 추천'],
      en: ['Employer networking days', 'Domestic & global internship referrals'],
    },
  },
];

const faqItems = [
  {
    question: {
      ko: '교육은 어떤 방식으로 진행되나요?',
      en: 'How is the programme delivered?',
    },
    answer: {
      ko: '집중 오프라인 워크숍과 실시간 온라인 세션을 병행하며 프로젝트와 코칭을 단계별로 제공합니다.',
      en: 'We blend on-site intensives with live online sessions, synchronising projects and coaching at every stage.',
    },
  },
  {
    question: {
      ko: '국내·글로벌 인턴십은 어떻게 연계되나요?',
      en: 'How are the domestic and global internships arranged?',
    },
    answer: {
      ko: '성과와 희망 분야를 기반으로 국내 기업 및 해외 파트너 인턴십을 추천하고 현지 온보딩을 지원합니다.',
      en: 'We recommend internships with domestic companies and overseas partners based on performance and goals, including local onboarding support.',
    },
  },
  {
    question: {
      ko: '커리큘럼을 기관에 맞게 구성할 수 있나요?',
      en: 'Can the curriculum be customised?',
    },
    answer: {
      ko: '네. 모듈 조합, 기간, 프로젝트 범위를 조정해 기관 맞춤 트랙을 설계합니다.',
      en: 'Yes. We tailor module combinations, duration, and project scope to design a dedicated track for your organisation.',
    },
  },
];

export default function Education() {
  const { language } = useLanguage();
  const chips =
    language === 'ko'
      ? ['AI 전문교육', '생성형 AI 심화', '해커톤 & 멘토링', '국내·글로벌 인턴십', '커리어 포트폴리오·면접']
      : ['AI Specialised Training', 'Generative AI Intensive', 'Hackathon & Mentoring', 'Domestic & Global Internships', 'Career Portfolio & Interviews'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="pt-24 pb-16">
        <section className="relative overflow-hidden bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-600 text-white">
          <div className="absolute inset-y-0 right-[-20%] h-full w-1/2 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-5xl px-6 py-24">
            <span className="text-sm uppercase tracking-[0.3em] text-white/70">AI Talent Pipeline</span>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
              {language === 'ko'
                ? '체계적인 AI 전문 인재 양성'
                : 'Structured development of AI specialists'}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-white/80">
              {language === 'ko'
                ? 'AI 전문교육, 생성형 AI 심화, 해커톤, 국내·글로벌 인턴십, 취업 포트폴리오까지 단계별 AI 인재 양성'
                : 'We deliver a practical journey that spans specialist education, generative AI training, hackathons, internships, and job-ready portfolios.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {chips.map((item) => (
                <span key={item} className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 flex max-w-6xl flex-col gap-10 px-6">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {language === 'ko' ? '교육 프로세스' : 'Training Process'}
            </h2>
          </div>

          <div className="flex flex-col gap-12">
            {processSteps.map((step, index) => {
              const hasImage = Boolean(step.image);
              const isReversed = hasImage && index % 2 === 1;
              const imageAlt = step.image?.alt?.[language] ?? step.image?.alt?.en ?? step.stage[language];

              return (
                <article
                  key={step.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div
                    className={`flex flex-col gap-8 p-6 md:gap-10 md:p-10 ${
                      hasImage ? 'md:flex-row md:items-stretch' : ''
                    } ${isReversed ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className="flex-1 space-y-5">
                      <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-600">
                        <span className="flex h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" aria-hidden="true" />
                        {step.stage[language]}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">{step.focus[language]}</h3>
                        <p className="text-sm leading-relaxed text-slate-600">{step.summary[language]}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {language === 'ko' ? '주요 학습 영역' : 'Key Components'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {step.modules[language].map((module) => (
                            <span
                              key={module}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {language === 'ko' ? '특장점' : 'Highlights'}
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {step.highlights[language].map((highlight) => (
                            <li key={highlight} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {hasImage && (
                      <div className="relative h-64 flex-1 overflow-hidden rounded-2xl md:h-auto">
                        <Image
                          src={step.image.src}
                          alt={imageAlt}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 40vw, 100vw"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-10 px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {language === 'ko' ? '생성형 AI 전문교육' : 'Generative AI Specialist Training'}
            </h2>
            <h2 className="mt-3 text-sm text-slate-500">
              {language === 'ko'
                ? '직무 중심 생성형 AI 활용 역량 강화'
                : 'Level up practical GenAI skills for every team'}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {generativeAIChips[language].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {generativeAITracks.map((track) => (
              <article
                key={track.id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{track.title[language]}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {track.description[language]}
                  </p>
                </div>
                <ul className="mt-auto space-y-2 text-sm text-slate-700">
                  {track.points[language].map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        
        <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-10 px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{language === 'ko' ? '함께하는 주요 고객' : 'Key Clients'}</h2>
            <p className="mt-3 text-sm text-slate-500">{language === 'ko' ? '공공, 제조, 금융, 교육 영역의 고객이 브레인웍스 AI 교육을 선택했습니다.' : 'Public, manufacturing, finance, and education leaders trust Brainworks as their AI training partner.'}</p>
          </div>
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-3">
            {educationClients.map((client) => (
              <div key={client.id} className="flex min-h-[120px] items-center justify-center rounded-2xl bg-slate-50 p-6">
                <img src={client.logo} alt={client.name} className="h-20 w-full object-contain grayscale transition hover:grayscale-0" />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 flex max-w-6xl flex-col gap-10 px-6">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {language === 'ko' ? '교육 프로그램 특장점' : 'Program Support Pillars'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {language === 'ko'
                ? '학습·프로젝트·커리어 지원을 연결해 교육 성과가 채용으로 이어지는 교육 프로그램'
                : 'Dedicated support connects learning, projects, and career services to turn outcomes into job offers.'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {supportPillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-slate-900">{pillar.title[language]}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{pillar.description[language]}</p>
                <ul className="mt-auto space-y-2 text-sm text-slate-700">
                  {pillar.points[language].map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 flex max-w-5xl flex-col gap-6 px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              {language === 'ko' ? '교육 상담 및 제휴 문의' : 'Training Enquiries'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {language === 'ko'
                ? '기관 맞춤 트랙, 제휴, 인턴 연계가 필요하다면 아래 버튼으로 문의해주세요.'
                : 'Need a customised track, institutional partnership, or internship linkage? Contact us using the button below.'}
            </p>
            <a
              href="/contact"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              {language === 'ko' ? '상담 신청' : 'Request Consultation'}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item, index) => (
              <details
                key={[item.question[language], index].join('-')}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200"
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  {item.question[language]}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.answer[language]}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
