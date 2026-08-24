import { useState } from "react";
import Link from "next/link";
import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNotice } from "@/server/modules/notices/repository";

type NoticeLocaleRow = { locale: string; title: string };
type AdminNotice = { id: string; version: number; slug: string; locales: NoticeLocaleRow[] };

export default function EditNotice({ notice }: { notice: AdminNotice }) {
  const [message, setMessage] = useState("");
  async function command(path: string, body: Record<string, unknown>) { const response = await fetch(`/api/admin/notices/${notice.id}/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setMessage(response.ok ? "처리했습니다." : "처리하지 못했습니다. 버전을 확인해 주세요."); }
  return <AdminShell activePath="/admin/notices"><AdminPageHeader title={notice.locales?.find((item) => item.locale === "ko")?.title || "공지사항 편집"} description={`현재 버전 ${notice.version}, 슬러그 ${notice.slug}`} /><section className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-[var(--bw-color-muted)]">이 화면은 상태 명령을 분리합니다. 방문자의 팝업 닫기와 관리자의 게시 중단은 서로 영향을 주지 않습니다.</p><div className="flex flex-wrap gap-3"><button onClick={() => command("publish", { locale: "ko", expectedVersion: notice.version })} className="rounded-full bg-[var(--bw-color-ink)] px-4 py-2 text-sm font-semibold text-white">국문 게시</button><button onClick={() => command("unpublish", { locale: "ko", expectedVersion: notice.version })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">게시 중단</button><button onClick={() => command("archive", { expectedVersion: notice.version })} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">보관</button><Link href={`/notices/${notice.slug}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">공개 보기</Link></div>{message ? <p role="status" className="text-sm text-[var(--bw-color-muted)]">{message}</p> : null}</section></AdminShell>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; const noticeId = typeof context.params?.noticeId === "string" ? context.params.noticeId : ""; return { props: { notice: await getAdminNotice(noticeId) } }; }
