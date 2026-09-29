// 메인 시각 이식에 사용하는 국문 및 영문 카피입니다.
// 영문 초안은 회사 확인 전까지 초안 상태로 유지합니다.

export const homeCopy = {
  // 슬롯은 사업 영역 이름(src/data/businessAreas.js)을 그대로 쓴다. 메인 히어로가 가져간다.
  heroQuestion: {
    ko: "{slot}를 도입하면\n당신의 업무가 어떻게 달라질 수 있을까요?",
    // en 초안, 회사 확인
    en: "How could {slot}\nchange the way you work?",
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
      ko: "AI 도입의 모든 단계를 브레인웍스가 맡습니다",
      // en 초안, 회사 확인
      en: "Brainworks covers every stage of AI adoption",
    },
    subtitle: {
      ko: "AI/AX 컨설팅, 솔루션 구축, 전문교육, 글로벌 프로그램",
      // en 초안, 회사 확인
      en: "AI consulting, solution building, professional education, and global programmes",
    },
  },
  services: [
    {
      id: "consulting",
      routeKey: "consulting",
      name: { ko: "AI/AX 컨설팅", en: "AI/AX Consulting" },
      desc: {
        ko: "비즈니스 목표와 조직 역량에 맞춘 AI 전략과 로드맵을 세우고, 파일럿 설계부터 MLOps 환경 구성까지 전주기를 지원합니다.",
        en: "We deliver AI consulting tailored to your operations—from strategy to deployment and optimisation.",
      },
      image: "/images/home/consulting.webp",
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
      image: "/images/home/solution.webp",
    },
    {
      id: "education",
      routeKey: "education",
      name: { ko: "AI 전문교육", en: "AI Professional Education" },
      desc: {
        ko: "데이터, 엔지니어링, 보안, 로봇, IoT 응용 역량을 높이는 AI 전문 교육을 운영합니다.",
        en: "Practical AI and AX education programmes from Brainworks.",
      },
      image: "/images/education/AI전문교육.jpg",
    },
    {
      id: "global",
      routeKey: "globalPrograms",
      name: { ko: "글로벌 프로그램", en: "Global Programmes" },
      desc: {
        ko: "해외 비즈니스 네트워크 구축과 글로벌 확장, 글로벌 AI 전문 교육을 지원합니다.",
        en: "A full-service accelerator that secures overseas buyers and accelerates your global expansion, supporting global AI education.",
      },
      image: "/images/education/Global.webp",
    },
  ],
  proofSection: {
    title: {
      ko: "왜 브레인웍스일까요?",
      // en 초안, 회사 확인
      en: "Why Brainworks?",
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
        ko: "산업을 이끄는 AI 스타트업",
        en: "An AI startup leading its industry",
      },
      desc: {
        ko: "대한민국리딩기업대상을 2년 연속 받으며 AI 솔루션 분야를 이끄는 기업으로 인정받았습니다.",
        // en 초안, 회사 확인
        en: "Brainworks won the Korea Leading Company Award two years in a row as a leader in AI solutions.",
      },
    },
    {
      label: { ko: "산학 협력", en: "Industry-academic partnership" },
      title: {
        ko: "대학과 함께 키우는 AI 인재",
        en: "Growing AI talent with universities",
      },
      desc: {
        ko: "국내외 대학 8곳과 손잡고 산업 현장에서 일할 AI 인재를 함께 키웁니다.",
        // en 초안, 회사 확인
        en: "We work with eight universities in Korea and abroad to develop AI talent for industry.",
      },
    },
  ],
  areasSection: {
    title: {
      ko: "산업마다 다른 AI를 설계합니다",
      // en 초안, 회사 확인
      en: "We design a different AI for each industry",
    },
  },
  solutionsSection: {
    title: {
      ko: "현장에 적용한 솔루션입니다",
      // en 초안, 회사 확인
      en: "Solutions applied in the field",
    },
  },
  newsSection: {
    title: {
      ko: "브레인웍스 소식",
      // en 초안, 회사 확인
      en: "Brainworks News",
    },
    more: { ko: "더 보기", en: "View all" },
  },
  contact: {
    title: {
      ko: "브레인웍스와 함께 문제를 해결해볼까요?",
      // en 초안, 회사 확인
      en: "Shall we solve the problem together?",
    },
    // 문의 페이지 안내 문장과 같은 문장을 쓴다.
    description: {
      ko: "문의 목적과 현재 상황을 알려주시면 적합한 담당자가 확인합니다.",
      // en 초안, 회사 확인
      en: "The right person at Brainworks reviews each enquiry by its purpose and current situation.",
    },
    label: { ko: "문의하기", en: "Contact us" },
  },
};
