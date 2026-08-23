import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useLocale } from "@/shared/routing/useLocale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-contact`;
}

export default function Contact() {
  const router = useRouter();
  const { language } = useLocale();
  const resultRef = useRef(null);
  const [form, setForm] = useState({ requestId: requestId(), topic: "other", area: "", name: "", email: "", company: "", message: "", privacyAccepted: false, website: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const topic = typeof router.query.topic === "string" && topics.some((item) => item.value === router.query.topic) ? router.query.topic : "other";
    setForm((current) => ({ ...current, topic, area: typeof router.query.area === "string" ? router.query.area.slice(0, 80) : "" }));
  }, [router.isReady, router.query.area, router.query.topic]);

  useEffect(() => { if (status === "success") resultRef.current?.focus(); }, [status]);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.privacyAccepted) { setError(language === "ko" ? "개인정보 수집·이용에 동의해 주세요." : "Please accept the privacy notice."); return; }
    setError(""); setStatus("submitting");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, locale: language }) });
      if (!response.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
      setError(language === "ko" ? "문의 전송에 실패했습니다. 입력 내용을 유지했으니 다시 시도하거나 대표 이메일로 연락해 주세요." : "We could not send your inquiry. Your input is preserved; please retry or use the representative email.");
    }
  }

  const disabled = status === "submitting" || status === "success";
  return <div className="min-h-screen bg-slate-50 text-slate-900"><Header /><SeoMetadata title={language === "ko" ? "문의하기 | 브레인웍스" : "Contact | Brainworks"} description={language === "ko" ? "브레인웍스에 AI 솔루션과 협업을 문의하세요." : "Contact Brainworks about AI solutions and collaboration."} /><main id="main-content"><PageHero eyebrow="Brainworks Contact" title={language === "ko" ? "문의하기" : "Contact us"} description={language === "ko" ? "해결하려는 문제와 필요한 협업을 알려주시면 담당자가 답변드립니다." : "Tell us what you are trying to solve and our team will follow up."} /><div className="mx-auto max-w-3xl px-6 py-16"><form onSubmit={submit} className="relative grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" noValidate>
    <div className="grid gap-2"><label htmlFor="topic" className="text-sm font-semibold">{language === "ko" ? "문의 목적" : "Inquiry type"} <span aria-hidden="true">*</span></label><select id="topic" value={form.topic} onChange={update("topic")} disabled={disabled} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3">{topics.map((topic) => <option key={topic.value} value={topic.value}>{topic[language]}</option>)}</select></div>
    {form.area ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{language === "ko" ? "선택한 사업 영역" : "Selected business area"}: <strong>{form.area}</strong></div> : null}
    <div className="grid gap-6 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold" htmlFor="name">{language === "ko" ? "이름" : "Name"}<span aria-hidden="true">*</span><input id="name" name="name" required autoComplete="name" value={form.name} onChange={update("name")} disabled={disabled} className="min-h-11 rounded-xl border border-slate-300 px-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold" htmlFor="email">{language === "ko" ? "이메일" : "Email"}<span aria-hidden="true">*</span><input id="email" name="email" required type="email" autoComplete="email" value={form.email} onChange={update("email")} disabled={disabled} className="min-h-11 rounded-xl border border-slate-300 px-3 font-normal" /></label></div>
    <label className="grid gap-2 text-sm font-semibold" htmlFor="company">{language === "ko" ? "회사명" : "Company"}<span className="font-normal text-slate-500">({language === "ko" ? "선택" : "optional"})</span><input id="company" name="company" autoComplete="organization" value={form.company} onChange={update("company")} disabled={disabled} className="min-h-11 rounded-xl border border-slate-300 px-3 font-normal" /></label>
    <label className="grid gap-2 text-sm font-semibold" htmlFor="message">{language === "ko" ? "문의내용" : "Message"}<span aria-hidden="true">*</span><textarea id="message" name="message" required minLength={10} rows={8} value={form.message} onChange={update("message")} disabled={disabled} className="rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label>
    <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" checked={form.privacyAccepted} onChange={update("privacyAccepted")} disabled={disabled} className="mt-1 h-4 w-4" /><span>{language === "ko" ? "문의 처리를 위한 개인정보 수집·이용에 동의합니다. 수집 항목, 목적, 보유 기간은 실제 개인정보 처리방침을 따릅니다." : "I agree to the collection and use of personal information to process this inquiry."} <span aria-hidden="true">*</span></span></label>
    <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" name="website" value={form.website} onChange={update("website")} />
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    <button type="submit" disabled={disabled} className="min-h-12 rounded-full bg-[var(--bw-color-ink)] px-6 text-sm font-semibold text-white disabled:opacity-50">{status === "submitting" ? (language === "ko" ? "전송 중…" : "Sending…") : language === "ko" ? "문의 보내기" : "Send inquiry"}</button>
    <div ref={resultRef} tabIndex={-1} aria-live="polite" className="text-sm">{status === "success" ? <p className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{language === "ko" ? "문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다." : "Your inquiry has been received. We will follow up soon."}</p> : null}</div>
  </form><p className="mt-6 text-center text-sm text-slate-500">{language === "ko" ? "대체 연락처: austin@brainworks.co.kr" : "Alternative contact: austin@brainworks.co.kr"}</p></div></main><Footer /></div>;
}
