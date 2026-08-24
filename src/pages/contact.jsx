import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useLocale } from "@/shared/routing/useLocale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";

const topics = [
  { value: "solution", ko: "AI 솔루션", en: "AI solutions" },
  { value: "consulting", ko: "AI 컨설팅", en: "AI consulting" },
  { value: "education", ko: "AI 전문교육", en: "AI education" },
  { value: "global", ko: "글로벌 프로그램", en: "Global programs" },
  { value: "other", ko: "기타 문의", en: "Other" },
];

function requestId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-contact`;
}

export default function Contact() {
  const router = useRouter();
  const { language } = useLocale();
  const resultRef = useRef(null);
  const [form, setForm] = useState({
    requestId: requestId(),
    topic: "",
    area: "",
    name: "",
    email: "",
    company: "",
    message: "",
    privacyAccepted: false,
    website: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const topic =
      typeof router.query.topic === "string" &&
      topics.some((item) => item.value === router.query.topic)
        ? router.query.topic
        : "";
    setForm((current) => ({
      ...current,
      topic,
      area:
        typeof router.query.area === "string"
          ? router.query.area.slice(0, 80)
          : "",
    }));
  }, [router.isReady, router.query.area, router.query.topic]);

  useEffect(() => {
    if (status === "success") resultRef.current?.focus();
  }, [status]);
  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));

  async function submit(event) {
    event.preventDefault();
    if (!form.topic) {
      setError(
        language === "ko"
          ? "문의 목적을 선택해 주세요."
          : "Please choose an inquiry type.",
      );
      return;
    }
    if (!form.privacyAccepted) {
      setError(
        language === "ko"
          ? "개인정보 수집·이용에 동의해 주세요."
          : "Please accept the privacy notice.",
      );
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale: language }),
      });
      if (!response.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
      setError(
        language === "ko"
          ? "문의 전송에 실패했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요."
          : "We could not send your inquiry. Your input is preserved; please try again shortly.",
      );
    }
  }

  const disabled = status === "submitting" || status === "success";
  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata
        title={
          language === "ko" ? "문의하기 | 브레인웍스" : "Contact | Brainworks"
        }
        description={
          language === "ko"
            ? "브레인웍스에 AI 솔루션과 협업을 문의하세요."
            : "Contact Brainworks about AI solutions and collaboration."
        }
      />
      <main id="main-content">
        <PageHero
          variant="plain"
          eyebrow="Brainworks Contact"
          title={language === "ko" ? "문의하기" : "Contact us"}
          description={
            language === "ko"
              ? "해결하려는 문제와 필요한 협업을 알려주시면 담당자가 답변드립니다."
              : "Tell us what you are trying to solve and our team will follow up."
          }
        />
        <div className="mx-auto max-w-4xl px-6 py-16">
          <form
            aria-labelledby="contact-form-title"
            onSubmit={submit}
            className="relative grid gap-8 rounded-[var(--bw-radius-feature)] border border-[var(--bw-color-line)] bg-[var(--bw-color-surface)] p-6 shadow-[var(--bw-shadow-soft)] md:gap-10 md:p-10"
            noValidate
          >
            <header className="grid gap-3 border-b border-[var(--bw-color-line)] pb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
                Contact form
              </p>
              <h2
                id="contact-form-title"
                className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl"
              >
                {language === "ko"
                  ? "문의 내용을 남겨주세요."
                  : "Tell us what you are working on."}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-[var(--bw-color-muted)]">
                {language === "ko"
                  ? "문의 목적과 현재 상황을 알려주시면 적합한 담당자가 확인합니다."
                  : "Share your goal and context so the right person can follow up."}
              </p>
            </header>

            <section
              aria-labelledby="contact-topic-title"
              className="grid gap-4"
            >
              <div className="grid gap-1">
                <h3 id="contact-topic-title" className="text-sm font-semibold">
                  {language === "ko" ? "문의 목적" : "Inquiry type"}
                </h3>
                <p className="text-sm text-[var(--bw-color-muted)]">
                  {language === "ko"
                    ? "가장 가까운 문의 목적을 선택해 주세요."
                    : "Choose the reason that best describes your inquiry."}
                </p>
              </div>
              <div
                className="grid gap-2 sm:grid-cols-2"
                role="radiogroup"
                aria-label={language === "ko" ? "문의 목적" : "Inquiry type"}
                aria-required="true"
              >
                {topics.map((topic) => (
                  <label
                    key={topic.value}
                    className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--bw-radius-control)] border border-[var(--bw-color-line)] px-4 text-sm font-medium text-[var(--bw-color-ink)] transition hover:border-[var(--bw-color-brand)] has-[:checked]:border-[var(--bw-color-brand)] has-[:checked]:bg-[var(--bw-color-surface-muted)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--bw-color-brand)]/40"
                  >
                    <input
                      type="radio"
                      name="topic"
                      value={topic.value}
                      checked={form.topic === topic.value}
                      onChange={update("topic")}
                      disabled={disabled}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--bw-color-line)] group-has-[:checked]:border-[var(--bw-color-brand)] group-has-[:checked]:bg-[var(--bw-color-brand)]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100" />
                    </span>
                    <span>{topic[language]}</span>
                  </label>
                ))}
              </div>
              {form.area ? (
                <div className="rounded-[var(--bw-radius-card)] bg-[var(--bw-color-surface-muted)] px-4 py-3 text-sm text-[var(--bw-color-muted)]">
                  {language === "ko"
                    ? "선택한 사업 영역"
                    : "Selected business area"}
                  :{" "}
                  <strong className="text-[var(--bw-color-ink)]">
                    {form.area}
                  </strong>
                </div>
              ) : null}
            </section>

            <section
              aria-labelledby="contact-details-title"
              className="grid gap-4 border-t border-[var(--bw-color-line)] pt-8"
            >
              <div className="grid gap-1">
                <h3
                  id="contact-details-title"
                  className="text-sm font-semibold"
                >
                  {language === "ko" ? "연락처 정보" : "Contact details"}
                </h3>
                <p className="text-sm text-[var(--bw-color-muted)]">
                  {language === "ko"
                    ? "답변을 받을 수 있는 연락처를 남겨주세요."
                    : "Tell us how we can reach you."}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label
                  className="grid gap-2 text-sm font-semibold"
                  htmlFor="name"
                >
                  {language === "ko" ? "이름" : "Name"}
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={update("name")}
                    disabled={disabled}
                    className="min-h-11 rounded-[var(--bw-radius-control)] border border-slate-300 px-3 font-normal outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
                  />
                </label>
                <label
                  className="grid gap-2 text-sm font-semibold"
                  htmlFor="email"
                >
                  {language === "ko" ? "이메일" : "Email"}
                  <input
                    id="email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    disabled={disabled}
                    className="min-h-11 rounded-[var(--bw-radius-control)] border border-slate-300 px-3 font-normal outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
                  />
                </label>
              </div>
              <label
                className="grid gap-2 text-sm font-semibold"
                htmlFor="company"
              >
                {language === "ko" ? "회사명" : "Company"}
                <span className="font-normal text-[var(--bw-color-muted)]">
                  ({language === "ko" ? "선택" : "optional"})
                </span>
                <input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={update("company")}
                  disabled={disabled}
                  className="min-h-11 rounded-[var(--bw-radius-control)] border border-slate-300 px-3 font-normal outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
                />
              </label>
            </section>

            <section
              aria-labelledby="contact-message-title"
              className="grid gap-4 border-t border-[var(--bw-color-line)] pt-8"
            >
              <div className="grid gap-1">
                <h3
                  id="contact-message-title"
                  className="text-sm font-semibold"
                >
                  {language === "ko" ? "문의 내용" : "Project details"}
                </h3>
                <p className="text-sm text-[var(--bw-color-muted)]">
                  {language === "ko"
                    ? "해결하려는 문제와 필요한 협업을 자유롭게 적어주세요."
                    : "Describe the challenge and collaboration you have in mind."}
                </p>
              </div>
              <textarea
                id="message"
                name="message"
                required
                minLength={10}
                rows={8}
                aria-label={language === "ko" ? "문의 내용" : "Project details"}
                value={form.message}
                onChange={update("message")}
                disabled={disabled}
                className="rounded-[var(--bw-radius-control)] border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
              />
            </section>

            <div className="grid gap-5 border-t border-[var(--bw-color-line)] pt-8">
              <label className="flex items-start gap-3 text-sm text-[var(--bw-color-muted)]">
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={update("privacyAccepted")}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 accent-[var(--bw-color-brand)]"
                />
                <span>
                  {language === "ko"
                    ? "문의 처리를 위한 개인정보 수집·이용에 동의합니다. 수집 항목, 목적, 보유 기간은 실제 개인정보 처리방침을 따릅니다."
                    : "I agree to the collection and use of personal information to process this inquiry."}
                </span>
              </label>
            </div>
            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
              name="website"
              value={form.website}
              onChange={update("website")}
            />
            {error ? (
              <p
                role="alert"
                className="rounded-[var(--bw-radius-card)] border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={disabled}
              className="min-h-12 w-full rounded-full bg-[var(--bw-color-ink)] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {status === "submitting"
                ? language === "ko"
                  ? "전송 중…"
                  : "Sending…"
                : language === "ko"
                  ? "문의 보내기"
                  : "Send inquiry"}
            </Button>
            <div
              ref={resultRef}
              tabIndex={-1}
              aria-live="polite"
              className="text-sm"
            >
              {status === "success" ? (
                <p className="rounded-[var(--bw-radius-card)] border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  {language === "ko"
                    ? "문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다."
                    : "Your inquiry has been received. We will follow up soon."}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
