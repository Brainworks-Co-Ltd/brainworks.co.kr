import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNoticeList } from "@/server/modules/notices/queries";

const publicationStatusLabel = {
  DRAFT: "초안",
  SCHEDULED: "예약 게시",
  PUBLISHED: "게시 중",
  UNPUBLISHED: "게시 중단",
};

export default function AdminNotices({ data }) {
  return <AdminShell activePath="/admin/notices"><AdminPageHeader title="공지사항" description="국문 및 영문 공지사항의 초안과 공개 상태를 관리합니다." action={<div className="flex gap-2"><Link href="/admin/notices/categories" className="inline-flex min-h-10 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold">카테고리</Link><Link href="/admin/notices/new" className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white">새 공지</Link></div>} /><section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">{data.items.length ? <ul className="divide-y divide-slate-200">{data.items.map((item) => <li key={item.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs text-[var(--bw-color-muted)]">공지 번호 {item.publicNumber} · {item.displayDate} {item.isPinned ? "고정" : "일반"} | {item.itemStatus === "ARCHIVED" ? "보관" : "활성"}</p><h2 className="mt-1 font-semibold">{item.locales.ko?.title || item.locales.en?.title || "제목 없음"}</h2><p className="mt-2 text-xs text-[var(--bw-color-muted)]">한국어 {publicationStatusLabel[item.locales.ko?.publicationStatus] || "없음"}, English {publicationStatusLabel[item.locales.en?.publicationStatus] || "없음"}</p></div><div className="flex gap-3 text-sm"><Link href={`/admin/notices/${item.id}`} className="font-semibold underline-offset-4 hover:underline">편집</Link>{item.locales.ko?.publicationStatus === "PUBLISHED" || item.locales.en?.publicationStatus === "PUBLISHED" ? <Link href={`/notices/${item.publicNumber}`} className="font-semibold underline-offset-4 hover:underline">공개 보기</Link> : <span className="text-[var(--bw-color-muted)]">아직 공개되지 않음</span>}</div></li>)}</ul> : <p className="p-6 text-sm text-[var(--bw-color-muted)]">등록된 공지사항이 없습니다.</p>}</section></AdminShell>;
}

export async function getServerSideProps(context) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { data: { items: await getAdminNoticeList() } } };
}
