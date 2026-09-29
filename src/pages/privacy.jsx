import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";

const content = {
  ko: {
    title: "개인정보 처리방침",
    description: "브레인웍스 개인정보 처리방침입니다.",
    sections: [
      {
        heading: "1. 개인정보의 처리 목적",
        body: "브레인웍스(이하 \"회사\")는 홈페이지 문의 폼을 통해 접수된 문의에 응대하고 처리 내역을 기록, 관리하기 위한 목적으로 개인정보를 처리합니다.",
      },
      {
        heading: "2. 처리하는 개인정보 항목",
        body: "회사는 문의 폼을 통해 다음 항목만을 수집합니다. 이름, 이메일, 회사명(선택 입력), 문의 목적, 선택한 사업 영역(선택 입력), 문의 내용. 홈페이지에 접속하면 서버가 접속 IP 주소, 접속 일시, 요청한 페이지 주소, 브라우저 정보를 접속 기록으로 자동 저장합니다.",
      },
      {
        heading: "3. 개인정보의 보유 및 이용 기간",
        body: "문의 내용은 문의 처리 완료 후 6개월 동안 보관한 뒤 파기합니다. 서버 접속 기록은 14일 동안 보관한 뒤 자동으로 삭제합니다.",
      },
      {
        heading: "4. 개인정보의 제3자 제공",
        body: "회사는 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 현재 제3자 제공 사례는 없습니다.",
      },
      {
        heading: "5. 개인정보 처리의 위탁",
        body: "회사는 홈페이지 운영을 위해 다음 업무를 위탁합니다.\n카페24 주식회사: 홈페이지 서버 운영과 접속 기록 보관\n주식회사 가비아(하이웍스): 문의 메일 발송과 수신",
      },
      {
        heading: "6. 개인정보의 국외 이전",
        body: "회사는 홈페이지 운영을 위해 다음과 같이 개인정보를 국외에서 처리합니다.\n이전받는 자: 카페24 주식회사 (1588-3284)\n이전 국가: 일본 (오사카 데이터센터)\n이전 항목: 접속 기록(접속 IP 주소, 접속 일시, 요청한 페이지 주소, 브라우저 정보), 문의 폼 입력 항목\n이전 시기와 방법: 홈페이지에 접속하거나 문의를 제출할 때 암호화된 네트워크(HTTPS)로 전송\n보유 기간: 접속 기록은 14일 보관한 뒤 삭제하고, 문의 폼 입력 항목은 메일로 전달한 뒤 서버에 남기지 않습니다.\n국외 이전을 원하지 않으면 문의 폼 대신 이메일(austin@brainworks.co.kr)로 문의할 수 있습니다.",
      },
      {
        heading: "7. 정보주체의 권리와 행사 방법",
        body: "정보주체는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 권리 행사는 아래 10. 개인정보 보호책임자에게 문의하는 방법으로 할 수 있습니다.",
      },
      {
        heading: "8. 개인정보의 파기 절차 및 방법",
        body: "회사는 보유 기간이 지나거나 처리 목적을 달성한 개인정보를 지체 없이 파기합니다. 전자 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제하고, 종이 문서는 분쇄하거나 소각합니다.",
      },
      {
        heading: "9. 개인정보의 안전성 확보 조치",
        body: "회사는 관리자 시스템에 접근할 때 인증 절차를 적용하고, 홈페이지와 서버 사이의 전송 구간을 HTTPS로 암호화합니다. 문의 폼으로 받은 개인정보는 서버 데이터베이스에 저장하지 않고 메일로 전달하는 데만 사용합니다.",
      },
      {
        heading: "10. 개인정보 보호책임자",
        body: "개인정보 보호책임자는 강우현 대표입니다.\n전화: 010-6639-4084\n이메일: austin@brainworks.co.kr",
      },
      {
        heading: "11. 시행일",
        body: "이 방침은 2026년 10월 1일부터 시행합니다.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    description: "Privacy policy for Brainworks.",
    sections: [
      {
        heading: "1. Purpose of processing",
        body: 'Brainworks ("the Company") processes personal information to respond to inquiries submitted through the website contact form and to keep records of that processing.',
      },
      {
        heading: "2. Items collected",
        body: "The Company collects only the following items through the contact form: name, email, company name (optional), inquiry topic, selected business area (optional), and the inquiry message. When you visit the website, the server automatically records your IP address, access time, requested page address, and browser information in its access log.",
      },
      {
        heading: "3. Retention period",
        body: "Inquiry contents are kept for six months after an inquiry is resolved and then destroyed. Server access logs are kept for 14 days and then deleted automatically.",
      },
      {
        heading: "4. Provision to third parties",
        body: "The Company does not provide personal information to third parties without the data subject's consent. There is currently no such provision.",
      },
      {
        heading: "5. Outsourcing of processing",
        body: "The Company entrusts the following tasks to operate the website.\nCafe24 Corp.: website server operation and access log storage\nGabia Inc. (Hiworks): sending and receiving inquiry emails",
      },
      {
        heading: "6. Transfer of personal information abroad",
        body: "The Company processes personal information abroad to operate the website, as follows.\nRecipient: Cafe24 Corp. (+82-1588-3284)\nCountry: Japan (Osaka data center)\nItems: access logs (IP address, access time, requested page address, browser information) and contact form entries\nTiming and method: sent over an encrypted connection (HTTPS) when you visit the website or submit an inquiry\nRetention: access logs are deleted after 14 days, and contact form entries are forwarded by email and not kept on the server.\nIf you do not want your information transferred abroad, you can send your inquiry by email to austin@brainworks.co.kr instead of using the contact form.",
      },
      {
        heading: "7. Rights of data subjects and how to exercise them",
        body: "Data subjects may at any time request access to, correction of, deletion of, or suspension of processing of their personal information, by contacting the privacy officer listed in section 10 below.",
      },
      {
        heading: "8. Destruction procedure and method",
        body: "The Company destroys personal information without delay once the retention period has passed or the processing purpose has been achieved. Electronic files are permanently deleted using a method that prevents recovery, and paper documents are shredded or incinerated.",
      },
      {
        heading: "9. Measures to secure safety",
        body: "The Company applies an authentication procedure for access to its administrator system and encrypts traffic between the website and the server with HTTPS. Personal information received through the contact form is not stored in the server database; it is used only to forward the inquiry by email.",
      },
      {
        heading: "10. Privacy officer",
        body: "The privacy officer is Austin Kang, CEO.\nPhone: +82-10-6639-4084\nEmail: austin@brainworks.co.kr",
      },
      {
        heading: "11. Effective date",
        body: "This policy takes effect on October 1, 2026.",
      },
    ],
  },
};

export default function PrivacyPolicy() {
  const { locale } = useRouter();
  const copy = locale === "en" ? content.en : content.ko;

  return (
    <div className="min-h-screen bg-white text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata title={copy.title} description={copy.description} />
      <main id="main-content">
        <PageHero title={copy.title} description={copy.description} />
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="grid gap-10">
            {copy.sections.map((section) => (
              <section key={section.heading} className="grid gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.01em]">
                  {section.heading}
                </h2>
                <p className="whitespace-pre-line text-sm leading-7 text-[var(--bw-color-muted)]">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
