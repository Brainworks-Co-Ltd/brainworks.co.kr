import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutSidebar from '@/components/AboutSidebar';
import { useLanguage } from '@/contexts/LanguageContext';



export default function About() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white py-20">
        <div className="container mx-auto mt-16 px-4">
          <div className="flex flex-col gap-12 lg:flex-row">
            <AboutSidebar active="overview" />

            <div className="flex-1 lg:max-w-5xl xl:max-w-6xl">
              <h2 className="mb-16 text-center text-4xl font-bold text-slate-900 md:text-5xl">
                {language === 'ko' ? 'CEO 메시지' : 'CEO Message'}
              </h2>
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
                <div className="flex justify-center lg:w-1/2">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg">
                    <img
                      src="/images/대표사진.png"
                      alt={language === 'ko' ? 'CEO 사진' : 'CEO photo'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-6 text-left text-lg leading-relaxed text-slate-800 lg:w-1/2">
                  <p>
                    {language === 'ko'
                      ? '안녕하세요, 브레인웍스 대표 강우현입니다.'
                      : "Hello, I am Austin Kang, CEO of Brainworks."}
                  </p>
                  <p>
                    {language === 'ko'
                      ? '브레인웍스는 "최고의 AI·빅데이터 전문기업"을 목표로 창업한 회사로, 기술이 아닌 ‘고객이 해결해야 할 문제’를 중심에 두고 있습니다. 우리는 현장의 목소리를 직접 듣고, 문제를 정확히 정의하며, 실제 업무 흐름에 스며드는 AI 적용 솔루션을 설계합니다. 이 과정에서 가장 중요한 기준은 화려한 성능 지표가 아니라, 현장에서 곧바로 쓰이고 지속적으로 가치를 쌓아갈 수 있는지입니다.'
                      : "Founded with the vision of becoming the 'best AI and big data specialist company,' Brainworks focuses on the 'real-world problems' that technology should solve rather than the technology itself. We listen directly to our customers, accurately define their problems, and create AI application solutions that seamlessly integrate into actual workflows. The most important criterion in this process is not flashy performance metrics but whether the solutions can be immediately used in the field and continuously accumulate value."}
                  </p>
                  <p>
                    {language === 'ko'
                      ? '브레인웍스는 존재 이유가 분명합니다. 고객의 고민을 함께 나누고, 해결로 가는 여정에 동행하며, 그 과정에서 함께 성장하는 것. 우리는 프로젝트를 납품으로 끝내지 않습니다. 데이터 수집과 정제, 모델 설계와 검증, 운영 단계의 모니터링과 개선까지 전 과정을 고객과 함께 설계합니다. 이를 통해 현장에서 체감하는 생산성 향상, 의사결정 정확도 향상, 운영 리스크 감소의 결과를 만들어 왔습니다.'
                      : "The reason for Brainworks' existence is clear. We share our customers' concerns, accompany them on their journey to solutions, and grow together in the process. We do not end projects with mere delivery. We collaboratively design the entire lifecycle, from data collection and cleaning to model design and validation, as well as monitoring and improvement during the operational phase. Through this approach, we have achieved tangible results that enhance productivity felt by the field, improve decision-making accuracy, and significantly reduce operational risks."}
                  </p>
                  <p>
                    {language === 'ko'
                      ? '우리는 AI 기술이 모든 산업과 조직에 보편적으로 적용될 수 있다고 믿지 않습니다. 각 산업과 조직이 처한 환경과 문제는 다르고, 따라서 해결책도 달라야 합니다. 브레인웍스는 제조, 에이전트, 헬스케어, 스마트시티 등 다양한 산업 분야에서 축적된 데이터와 현장 경험을 바탕으로 고객의 문제를 깊이 이해하고, 가장 적합한 AI 솔루션을 제안합니다. 이를 통해 고객은 빠르게 도입 가능한 AI 서비스를 경험할 수 있습니다.'
                      : "We do not believe that AI technology can be universally applied to all industries and organizations. Each industry and organization faces different environments and problems, and therefore, the solutions must also differ. Based on accumulated data and field experience in various industries such as manufacturing, agents, healthcare, and smart cities, Brainworks deeply understands our customers' problems and proposes the most suitable AI solutions. This allows our customers to experience rapidly deployable AI services."}
                  </p>
                  <p>
                    {language === 'ko'
                      ? '기술 철학 또한 분명합니다. 첫째, 문제 정의 우선의 ‘Problem-First’ 접근. 둘째, 학습과 개선을 빠르게 반복하는 ‘Lean AI’ 문화. 셋째, 고객의 데이터와 맥락을 존중하는 ‘Responsible AI’ 원칙입니다. 우리는 최신 모델과 프레임워크를 무분별하게 도입하기보다, 데이터 품질과 활용 시나리오에 맞춘 가장 경제적이고 탄력적인 아키텍처를 선택합니다. 또한 보안과 개인정보 보호, 거버넌스를 기본값으로 설계해 신뢰 가능한 AI를 지향합니다.'
                      : "Our technological philosophy is also clear. First, a 'Problem-First' approach that prioritizes problem definition. Second, a 'Lean AI' culture that rapidly iterates learning and improvement. Third, 'Responsible AI' principles that respect customers' data and context. Rather than indiscriminately adopting the latest models and frameworks, we choose the most economical and flexible architecture tailored to data quality and usage scenarios. We also design with security, privacy protection, and governance as defaults, aiming for trustworthy AI."}
                  </p>
                  <p>
                    {language === 'ko'
                      ? '브레인웍스를 믿고 함께해 주시는 모든 분들께 감사드립니다. 오늘의 작은 개선이 내일의 큰 도약이 되도록, 우리는 현장의 언어로 답하는 AI, 지속 가능한 가치를 만드는 AI를 꾸준히 만들어 가겠습니다. 감사합니다.'
                      : "We are grateful to everyone who trusts and collaborates with Brainworks. To ensure that today's small improvements lead to tomorrow's significant leaps, we will continue to create AI that responds in the language of the field and generates sustainable value. Thank you."}
                  </p>
                  <div className="pt-6 text-right text-xl font-semibold text-gray-900">
                    {language === 'ko' ? '브레인웍스 CEO 강우현' : 'Austin Kang, CEO of Brainworks'}
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}











