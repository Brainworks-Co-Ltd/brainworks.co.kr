import { useState } from "react";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminPopupNotice } from "@/server/modules/popup-notices/repository";

type PopupNotice = { id: string; version: number; locales: Array<{ locale: string; title: string }> };
export default function EditPopupNotice({ notice }: { notice: PopupNotice }) {
  const [message, setMessage] = useState("");
  async function command(path: string, body: Record<string, unknown>) { const response = await fetch(`/api/admin/popup-notices/${notice.id}/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setMessage(response.ok ? "처리했습니다." : "처리하지 못했습니다. 버전을 확인해 주세요."); }
  return <AdminShell activePath="/admin/popup-notices"><AdminPageHeader title={notice.locales.find((locale) => locale.locale === "ko")?.title || "팝업 공지 편집"} description={`현재 버전 ${notice.version}, 연결 공지는 선택 사항입니다.`} /><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap gap-3"><button onClick={() => command("publish", { locale: "ko", expectedVersion: notice.version })} className="rounded-full bg-[var(--bw-color-ink)] px-4 py-2 text-sm font-semibold text-white">국문 게시</button><button onClick={() => command("unpublish", { locale: "ko", expectedVersion: notice.version })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">게시 중단</button><button onClick={() => command("renotify", { expectedVersion: notice.version })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">수정 내용을 다시 알림</button><Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">홈 미리보기</Link></div>{message ? <p role="status" className="mt-4 text-sm text-[var(--bw-color-muted)]">{message}</p> : null}</section></AdminShell>;
}
export async function getServerSideProps(context: GetServerSidePropsContext) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; const id = typeof context.params?.popupNoticeId === "string" ? context.params.popupNoticeId : ""; return { props: { notice: await getAdminPopupNotice(id) } }; }
