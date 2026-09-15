// 메인 시각 이식에 사용하는 국문 및 영문 카피입니다.
// 영문 초안은 회사 확인 전까지 초안 상태로 유지합니다.

export const homeCopy = {
  heroSlots: [
    { ko: "제조 현장", en: "Manufacturing floor" },
    { ko: "진료 현장", en: "Clinical floor" },
    { ko: "도시 관제", en: "City operations" },
    { ko: "고객 응대", en: "Customer service" },
  ],
  heroQuestion: {
    ko: "{slot}의 어떤 문제부터 풀어야 할까요?",
    // en 초안, 회사 확인
    en: "Which problem should we solve first in the {slot}?",
  },
  identity: {
    ko: "브레인웍스는 제조, 헬스케어, 스마트시티, AI 에이전트 영역의 AI를 직접 설계하고 구축합니다.",
    // en 초안, 회사 확인
    en: "Brainworks designs and builds AI for manufacturing, healthcare, smart cities, and AI agents.",
  },
  media: {
    eyebrow: { ko: "산업별 AI 전문기업", en: "Industry AI specialist" },
    title: {
      ko: "브레인웍스가 함께합니다",
      en: "Brainworks works alongside you",
    },
    // en 초안, 회사 확인
    description: {
      ko: "현장의 문제를 함께 살피고 필요한 AI를 설계합니다.",
      en: "We examine the problems in your operations and design the AI you need.",
    },
  },
  serviceSection: {
    title: {
      ko: "브레인웍스는 AI 도입에 필요한 서비스를 제공합니다",
      // en 초안, 회사 확인
      en: "Brainworks provides the services you need to adopt AI",
    },
    subtitle: {
      ko: "AI 컨설팅, 솔루션 구축, 전문교육, 글로벌 프로그램",
      // en 초안, 회사 확인
      en: "AI consulting, solution building, professional education, and global programmes",
    },
  },
  services: [
    {
      id: "consulting",
      routeKey: "consulting",
      name: { ko: "AI 컨설팅", en: "AI Consulting" },
      desc: {
        ko: "비즈니스 목표와 조직 역량에 맞춘 AI 전략과 로드맵을 세우고, 파일럿 설계부터 MLOps 환경 구성까지 전주기를 지원합니다.",
        en: "We deliver AI consulting tailored to your operations—from strategy to deployment and optimisation.",
      },
      image: "/images/services/hero/consulting.webp",
    },
    {
      id: "solution",
      routeKey: "solutions.list",
      name: { ko: "AI 솔루션", en: "AI Solutions" },
      desc: {
        ko: "제조, 에이전트, 헬스케어와 바이오, 스마트시티와 안전 네 영역에서 현장 데이터로 솔루션을 구축합니다.",
        // en 초안, 회사 확인
        en: "We build solutions from field data across manufacturing, agents, healthcare and bio, and smart city and safety.",
      },
      image: "/images/services/hero/manufacturing.webp",
    },
    {
      id: "education",
      routeKey: "education",
      name: { ko: "AI 전문교육", en: "AI Professional Education" },
      desc: {
        ko: "데이터, 엔지니어링, 보안, 로봇, IoT 응용 역량을 높이는 AI 전문 교육을 운영합니다.",
        en: "Practical AI and AX education programmes from Brainworks.",
      },
      image: "/images/services/hero/education.webp",
    },
    {
      id: "global",
      routeKey: "globalPrograms",
      name: { ko: "글로벌 프로그램", en: "Global Programmes" },
      desc: {
        ko: "해외 비즈니스 네트워크 구축과 글로벌 확장, 글로벌 AI 전문 교육을 지원합니다.",
        en: "A full-service accelerator that secures overseas buyers and accelerates your global expansion, supporting global AI education.",
      },
      image: "/images/services/hero/smartcity.webp",
    },
  ],
  proofSection: {
    title: {
      ko: "많은 기업과 기관이 브레인웍스를 선택하는 데에는 이유가 있습니다",
      // en 초안, 회사 확인
      en: "There are reasons many companies and institutions choose Brainworks",
    },
  },
  proofs: [
    {
      label: { ko: "산업 AI", en: "Industry AI" },
      title: { ko: "산업별 AI 전문기업", en: "An industry AI specialist" },
      desc: {
        ko: "제조, 헬스케어, 스마트시티, AI 에이전트 네 영역의 솔루션을 직접 설계하고 구축합니다.",
        // en 초안, 회사 확인
        en: "We design and build solutions across manufacturing, healthcare, smart cities, and AI agents.",
      },
    },
    {
      label: { ko: "국가 과제", en: "National projects" },
      title: {
        ko: "국가 과제 주관사",
        en: "Lead organisation for national projects",
      },
      desc: {
        ko: "과학기술정보통신부와 NIPA의 AI 반도체 해외 실증 지원 사업을 주관합니다.",
        // en 초안, 회사 확인
        en: "We lead an overseas demonstration programme for AI semiconductors with MSIT and NIPA.",
      },
    },
    {
      label: { ko: "수상", en: "Awards" },
      title: {
        ko: "리딩기업대상 2년 연속",
        en: "Leading Enterprise Award for two consecutive years",
      },
      desc: {
        ko: "대한민국리딩기업대상 AI 솔루션 부문 스타트업대상을 2년 연속 받았습니다.",
        // en 초안, 회사 확인
        en: "We received the startup award in the AI solutions category for two consecutive years.",
      },
    },
    {
      label: { ko: "산학 협력", en: "Industry-academic partnership" },
      title: {
        ko: "대학과 함께 키우는 인재",
        en: "Growing talent with universities",
      },
      desc: {
        ko: "국립순천대, 순천향대와 AI 인재 양성 과정을 함께 운영합니다.",
        // en 초안, 회사 확인
        en: "We run AI talent development programmes with universities.",
      },
    },
  ],
  areasSection: {
    title: {
      ko: "브레인웍스의 사업 영역을 소개합니다",
      // en 초안, 회사 확인
      en: "Explore Brainworks business areas",
    },
  },
  solutionsSection: {
    title: {
      ko: "현장에 적용한 솔루션을 보여드립니다",
      // en 초안, 회사 확인
      en: "See the solutions applied in the field",
    },
  },
  newsSection: {
    title: {
      ko: "브레인웍스의 최근 소식을 전합니다",
      // en 초안, 회사 확인
      en: "The latest news from Brainworks",
    },
    more: { ko: "더 보기", en: "View all" },
  },
  contact: {
    title: {
      ko: "현장의 문제를 AI로 풀 준비가 되셨나요?",
      // en 초안, 회사 확인
      en: "Are you ready to solve a problem in your operations with AI?",
    },
    label: { ko: "브레인웍스에 문의하기", en: "Contact Brainworks" },
  },
};
