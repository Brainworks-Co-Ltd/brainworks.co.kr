import type { GetServerSidePropsContext } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNotice } from "@/server/modules/notices/repository";
import { markdownToHtml } from "@/lib/markdown";

export default function NoticePreview({ notice }: { notice: { title: string; bodyHtml: string } }) { return <AdminShell activePath="/admin/notices"><div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">미리보기 · 실제 공개 상태 변경 없음</p><h1 className="mt-4 text-3xl font-semibold">{notice.title}</h1><div className="prose mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: notice.bodyHtml }} /></div></AdminShell>; }
export async function getServerSideProps(context: GetServerSidePropsContext) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; const id = typeof context.params?.contentId === "string" ? context.params.contentId : ""; const item = await getAdminNotice(id); const locale = item.locales.find((value) => value.locale === "ko"); return { props: { notice: { title: locale?.title || "", bodyHtml: markdownToHtml(locale?.bodyMarkdown || "") } } }; }
