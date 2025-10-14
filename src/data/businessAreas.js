export const businessAreas = [
  {
    id: 'manufacturing',
    name: {
      ko: 'Manufacturing AI',
      en: 'Manufacturing AI',
    },
    subtitle: {
      ko: '공정 데이터 기반의 생산 혁신',
      en: 'Process data-driven manufacturing innovation',
    },
    description: {
      ko: '공정 진동 이상 탐지부터 불량품 판별, 수율 예측까지 제조 현장의 효율을 극대화하는 AI 솔루션을 제공합니다.',
      en: 'From vibration anomaly detection to defect classification and yield prediction, our AI delivers peak efficiency on the production floor.',
    },
    heroImage: '/images/services/제조AI.jpg',
    accent: 'from-sky-500 to-blue-700',
    solutions: [
      {
        id: 'vibration',
        name: {
          ko: 'AI 진동 이상 탐지 솔루션',
          en: 'AI Vibration Anomaly Detection',
        },
        description: {
          ko: '설비 진동 데이터를 실시간 분석해 이상 징후를 선제 대응합니다.',
          en: 'Monitors equipment vibration in real time and flags anomalies before downtime occurs.',
        },
        image: '/images/services/진동이상감지.png',
      },
      {
        id: 'vision',
        name: {
          ko: 'AI 비전 불량 판별 솔루션',
          en: 'AI Vision-Based Defect Classification',
        },
        description: {
          ko: '고품질 영상 분석으로 불량품을 자동 식별하고 재작업 비용을 절감합니다.',
          en: 'High-fidelity image analytics identify defective goods and cut rework costs.',
        },
        image: '/images/services/AI불량판별솔루션.png',
      },
      {
        id: 'yield',
        name: {
          ko: 'AI 수율 예측 솔루션',
          en: 'AI Yield Prediction',
        },
        description: {
          ko: '과거 생산 이력과 공정 데이터를 학습해 수율을 미리 예측합니다.',
          en: 'Learns from production history to forecast yield with precision.',
        },
        image: '/images/services/AI수율분석솔루션.png',
      },
      {
        id: 'environment',
        name: {
          ko: 'AI 환경 분석 솔루션',
          en: 'AI Environment Analytics',
        },
        description: {
          ko: '설비 주변 환경 데이터를 분석해 품질 저하 요인을 사전에 파악합니다.',
          en: 'Analyses surrounding environmental data to surface quality risk factors early.',
        },
        image: '/images/services/AI환경분석솔루션.jpg',
      },
    ],
  },
  {
    id: 'agent',
    name: {
      ko: 'sLLM base AI Agent',
      en: 'sLLM base AI Agent',
    },
    subtitle: {
      ko: '대화형 AI로 업무 자동화와 고객 경험 강화',
      en: 'Conversational AI that automates work and elevates experiences',
    },
    description: {
      ko: 'sLLM 기반 음성·텍스트 지능 에이전트가 통역, 상담, 교육까지 폭넓게 지원합니다.',
      en: 'Small LLM-powered voice and text agents cover translation, support, and learning scenarios.',
    },
    heroImage: '/images/services/AIagent.jpg',
    accent: 'from-violet-600 to-fuchsia-500',
    solutions: [
      {
        id: 'voice',
        name: {
          ko: '실시간 음성 통역 Agent',
          en: 'Real-time Voice Translation Agent',
        },
        description: {
          ko: '다국어 회의와 글로벌 협업을 위한 초저지연 통역을 제공합니다.',
          en: 'Delivers low-latency translation for multilingual meetings and global collaboration.',
        },
        image: '/images/services/AI강의번역솔루션.png',
      },
      {
        id: 'edutech',
        name: {
          ko: 'sLLM 에듀테크 Q&A Agent',
          en: 'sLLM Edutech Q&A Agent',
        },
        description: {
          ko: '교육 콘텐츠를 이해하고 학습자 질문에 맞춤형 답변을 제공합니다.',
          en: 'Understands course material and responds to learner questions with tailored guidance.',
        },
        image: '/images/services/educhat.png',
      },

    ],
  },
  {
    id: 'healthcare',
    name: {
      ko: 'Healthcare & Bio AI',
      en: 'Healthcare & Bio AI',
    },
    subtitle: {
      ko: '의료·치과 데이터 분석으로 정밀 진단 구현',
      en: 'Precision diagnostics for medical and dental specialists',
    },
    description: {
      ko: '심전도 분석과 치아 자동 디자인 등 의료 현장의 정확성과 속도를 높이는 AI를 제공합니다.',
      en: 'ECG analytics and automated dental design speed up clinical decisions and improve accuracy.',
    },
    heroImage: '/images/services/헬스케어AI.jpg',
    accent: 'from-emerald-500 to-cyan-500',
    solutions: [
      {
        id: 'ecg',
        name: {
          ko: 'AI 심전도 분석 솔루션',
          en: 'AI ECG Analysis',
        },
        description: {
          ko: '심전도 신호를 정밀 분석해 이상 징후를 조기에 예측합니다.',
          en: 'Interprets ECG signals to flag cardiac risks early.',
        },
        image: '/images/services/AI심전도분석 기기.png',
      },
      {
        id: 'dental',
        name: {
          ko: 'AI 치아 자동 디자인 솔루션',
          en: 'AI Automated Dental Design',
        },
        description: {
          ko: '환자 데이터를 바탕으로 보철물과 교정 모델을 자동 설계합니다.',
          en: 'Automatically drafts dental prosthetics and orthodontic models from patient data.',
        },
        image: '/images/services/덴탈3D시각화솔루션.png',
      },
    ],
  },
  {
    id: 'smartcity',
    name: {
      ko: 'SmartCity & Safety AI',
      en: 'SmartCity & Safety AI',
    },
    subtitle: {
      ko: '도시 안전과 운영을 위한 데이터 기반 관제',
      en: 'Data-driven control towers for safer cities',
    },
    description: {
      ko: '위치 정보 기반 안전 관제와 드론 모니터링으로 스마트시티 구현을 가속화합니다.',
      en: 'Accelerates smart city deployment with geolocation safety control and drone monitoring.',
    },
    heroImage: '/images/services/스마트시티.jpg',
    accent: 'from-emerald-600 to-teal-500',
    solutions: [
      {
        id: 'location',
        name: {
          ko: 'AI 위치정보 기반 안전 관제',
          en: 'AI Location-based Safety Control',
        },
        description: {
          ko: '실시간 위치 데이터를 활용해 위험 구역과 근로자를 선제 관리합니다.',
          en: 'Uses live location feeds to safeguard workers and high-risk zones.',
        },
        image: '/images/services/AI위치정보분석 IoT솔루션.png',
      },
      {
        id: 'micromobility',
        name: {
          ko: 'AI 이륜차 안전 모니터링',
          en: 'AI Micromobility Safety Monitoring',
        },
        description: {
          ko: '이륜차·모빌리티 데이터를 분석해 사고 위험을 예측합니다.',
          en: 'Analyses micromobility data to predict and prevent incidents.',
        },
        image: '/images/services/AI이륜차.png',
      },
      {
        id: 'drone',
        name: {
          ko: 'AI 재난 드론 모니터링',
          en: 'AI Disaster Drone Monitoring',
        },
        description: {
          ko: '드론 영상과 센서 정보를 통합해 재난 대응 속도를 높입니다.',
          en: 'Fuses drone imagery and sensors to accelerate disaster response.',
        },
        image: '/images/services/ai-drone.webp',
      },
    ],
  },
];


export const getLocalizedBusinessAreas = (language) =>
  businessAreas.map((area) => ({
    ...area,
    title: area.name[language],
    subtitle: area.subtitle[language],
    description: area.description[language],
    solutions: area.solutions.map((solution) => ({
      ...solution,
      title: solution.name[language],
      description: solution.description[language],
    })),
  }));
