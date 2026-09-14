import type { GetServerSidePropsContext } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminPopupNotice } from "@/server/modules/popup-notices/repository";

export default function PopupPreview({ notice }: { notice: { title: string; body: string } }) { return <AdminShell activePath="/admin/popup-notices"><div className="mx-auto max-w-md"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">팝업 미리보기 · 실제 공개 상태 변경 없음</p><article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"><h1 className="text-xl font-semibold">{notice.title}</h1>{notice.body ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{notice.body}</p> : null}</article></div></AdminShell>; }
export async function getServerSideProps(context: GetServerSidePropsContext) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; const id = typeof context.params?.contentId === "string" ? context.params.contentId : ""; const item = await getAdminPopupNotice(id); const locale = item.locales.find((value) => value.locale === "ko"); return { props: { notice: { title: locale?.title || "", body: locale?.bodyMarkdown || "" } } }; }
