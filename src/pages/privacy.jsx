import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";

const content = {
  ko: {
    title: "개인정보 처리방침",
    description: "브레인웍스 개인정보 처리방침 초안입니다.",
    banner:
      "이 문서는 회사 검토 전 초안입니다. 시행일과 책임자 정보는 확인 후 확정합니다.",
    sections: [
      {
        heading: "1. 개인정보의 처리 목적",
        body: "브레인웍스(이하 \"회사\")는 홈페이지 문의 폼을 통해 접수된 문의에 응대하고 처리 내역을 기록, 관리하기 위한 목적으로 개인정보를 처리합니다.",
      },
      {
        heading: "2. 처리하는 개인정보 항목",
        body: "회사는 문의 폼을 통해 다음 항목만을 수집합니다. 이름, 이메일, 회사명(선택 입력), 문의 목적, 선택한 사업 영역(선택 입력), 문의 내용.",
      },
      {
        heading: "3. 개인정보의 보유 및 이용 기간",
        body: "문의 처리 완료 후 1년간 보유한 뒤 파기하는 방향으로 검토 중입니다. 정확한 보유 기간은 [확인 필요].",
      },
      {
        heading: "4. 개인정보의 제3자 제공",
        body: "회사는 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 현재 제3자 제공 사례는 없습니다.",
      },
      {
        heading: "5. 개인정보 처리의 위탁",
        body: "문의에 대한 답변 메일은 이메일 전송 인프라를 통해 발송됩니다. 이 과정을 외부 업체에 위탁하는지 여부와 수탁업체명은 [확인 필요].",
      },
      {
        heading: "6. 정보주체의 권리와 행사 방법",
        body: "정보주체는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 권리 행사는 아래 9. 개인정보 보호책임자에게 문의하는 방법으로 할 수 있습니다.",
      },
      {
        heading: "7. 개인정보의 파기 절차 및 방법",
        body: "회사는 보유 기간이 지나거나 처리 목적을 달성한 개인정보를 지체 없이 파기합니다. 전자 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제하고, 종이 문서는 분쇄하거나 소각합니다.",
      },
      {
        heading: "8. 개인정보의 안전성 확보 조치",
        body: "회사는 관리자 시스템에 접근할 때 인증 절차를 적용하고 있으며, 문의 폼으로 수집한 개인정보는 데이터베이스에 저장하지 않고 이메일 발송 용도로만 사용한 뒤 파기합니다.",
      },
      {
        heading: "9. 개인정보 보호책임자",
        body: "개인정보 보호책임자의 이름과 연락처는 [확인 필요].",
      },
      {
        heading: "10. 시행일",
        body: "이 방침의 시행일은 [확인 필요].",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    description: "Draft privacy policy for Brainworks.",
    banner:
      "This document is a draft pending internal company review. The effective date and officer contact will be finalized after confirmation.",
    sections: [
      {
        heading: "1. Purpose of processing",
        body: 'Brainworks ("the Company") processes personal information to respond to inquiries submitted through the website contact form and to keep records of that processing.',
      },
      {
        heading: "2. Items collected",
        body: "The Company collects only the following items through the contact form: name, email, company name (optional), inquiry topic, selected business area (optional), and the inquiry message.",
      },
      {
        heading: "3. Retention period",
        body: "We are considering retaining information for one year after an inquiry is resolved, then destroying it. The exact retention period is [to be confirmed].",
      },
      {
        heading: "4. Provision to third parties",
        body: "The Company does not provide personal information to third parties without the data subject's consent. There is currently no such provision.",
      },
      {
        heading: "5. Outsourcing of processing",
        body: "Reply emails are sent through an email delivery infrastructure. Whether this is outsourced to an external provider, and the name of any such provider, is [to be confirmed].",
      },
      {
        heading: "6. Rights of data subjects and how to exercise them",
        body: "Data subjects may at any time request access to, correction of, deletion of, or suspension of processing of their personal information, by contacting the privacy officer listed in section 9 below.",
      },
      {
        heading: "7. Destruction procedure and method",
        body: "The Company destroys personal information without delay once the retention period has passed or the processing purpose has been achieved. Electronic files are permanently deleted using a method that prevents recovery, and paper documents are shredded or incinerated.",
      },
      {
        heading: "8. Measures to secure safety",
        body: "The Company applies an authentication procedure for access to its administrator system, and personal information collected via the contact form is not stored in a database; it is used only to send a reply email and is then discarded.",
      },
      {
        heading: "9. Privacy officer",
        body: "The name and contact details of the privacy officer are [to be confirmed].",
      },
      {
        heading: "10. Effective date",
        body: "The effective date of this policy is [to be confirmed].",
      },
    ],
  },
};

export default function PrivacyPolicy() {
  const { locale } = useRouter();
  const copy = locale === "en" ? content.en : content.ko;

  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata title={copy.title} description={copy.description} />
      <main id="main-content">
        <PageHero title={copy.title} description={copy.description} />
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p
            role="note"
            className="mb-10 rounded-[var(--bw-radius-card)] border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900"
          >
            {copy.banner}
          </p>
          <div className="grid gap-10">
            {copy.sections.map((section) => (
              <section key={section.heading} className="grid gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.01em]">
                  {section.heading}
                </h2>
                <p className="text-sm leading-7 text-[var(--bw-color-muted)]">
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
