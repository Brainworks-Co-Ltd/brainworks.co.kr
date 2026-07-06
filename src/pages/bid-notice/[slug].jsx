import React from 'react';
import Link from 'next/link';
import { Download, FileText, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBidNoticeBySlug, getBidNoticeSlugs } from '@/data/bidNotices';

function translate(value, language) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.ko ?? value.en ?? '';
}

function formatDate(dateString, language) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export default function BidNoticeDetail({ notice }) {
  const { language } = useLanguage();

  if (!notice) {
    return null;
  }

  const details = notice.details?.[language] ?? notice.details?.ko ?? [];
  const attachments = notice.attachments ?? [];

  const overviewItems = [
    {
      label: language === 'ko' ? '용역기간' : 'Service Period',
      value: translate(notice.servicePeriod, language),
    },
    {
      label: language === 'ko' ? '사업예산' : 'Budget',
      value: translate(notice.budget, language),
    },
    {
      label: language === 'ko' ? '계약방식' : 'Contract Method',
      value: translate(notice.contractMethod, language),
    },
    {
      label: language === 'ko' ? '제출방법' : 'Submission Method',
      value: translate(notice.submissionMethod, language),
    },
    {
      label: language === 'ko' ? '대금지급' : 'Payment',
      value: translate(notice.payment, language),
    },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <main className="pt-28 pb-20">
        <article className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {translate(notice.category, language)}
              </span>
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {translate(notice.status, language)}
              </span>
              <span className="text-sm text-slate-500">{notice.noticeNo}</span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
              {translate(notice.title, language)}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {translate(notice.summary, language)}
            </p>

            <dl className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {language === 'ko' ? '게시일' : 'Posted'}
                </dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">
                  {formatDate(notice.postedAt, language)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {language === 'ko' ? '접수 시작' : 'Start'}
                </dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">
                  {formatDate(notice.submissionStart, language)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {language === 'ko' ? '접수 마감' : 'Deadline'}
                </dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">
                  {formatDate(notice.submissionEnd, language)}
                </dd>
              </div>
            </dl>

            {overviewItems.length > 0 && (
              <dl className="mt-6 grid gap-4 rounded-lg border border-slate-200 p-5 md:grid-cols-2">
                {overviewItems.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-slate-800">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-10 space-y-4">
              {details.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>

            {attachments.length > 0 && (
              <section className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-700" aria-hidden="true" />
                  <h2 className="text-base font-semibold text-slate-950">
                    {language === 'ko' ? '첨부파일 다운로드' : 'Downloads'}
                  </h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.href}
                      href={attachment.href}
                      download={attachment.fileName}
                      className="flex min-h-24 items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-950">
                          {translate(attachment.label, language)}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-slate-500">
                          {translate(attachment.description, language)}
                        </span>
                      </span>
                      <Download className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 rounded-lg border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-blue-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    {language === 'ko' ? '입찰 문의 및 제출처' : 'Bid Contact and Submission'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-blue-900">
                    {translate(notice.contact, language)} ·{' '}
                    <a href={`mailto:${notice.email}`} className="font-semibold underline">
                      {notice.email}
                    </a>
                  </p>
                  {notice.phone && (
                    <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-blue-900">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <a href={`tel:${notice.phone}`} className="font-semibold underline">
                        {notice.phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/bid-notice" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              {language === 'ko' ? '입찰 공고 목록으로 돌아가기' : 'Back to Bid Notice Board'}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: getBidNoticeSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const notice = getBidNoticeBySlug(params.slug);

  if (!notice) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      notice,
    },
  };
}
