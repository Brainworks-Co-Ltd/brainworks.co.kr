import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getPublishedNoticeList } from "@/server/modules/notices/queries";

export default function AdminNotices({ data }) {
  return <AdminShell activePath="/admin/notices"><AdminPageHeader title="공지사항" description="국문·영문 공지사항의 초안과 공개 상태를 관리합니다." action={<div className="flex gap-2"><Link href="/admin/notices/categories" className="inline-flex min-h-10 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold">카테고리</Link><Link href="/admin/notices/new" className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white">새 공지</Link></div>} /><section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">{data.items.length ? <ul className="divide-y divide-slate-200">{data.items.map((item) => <li key={item.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs text-[var(--bw-color-muted)]">{item.date} · {item.isPinned ? "고정" : "일반"}</p><h2 className="mt-1 font-semibold">{item.title}</h2></div><div className="flex gap-3 text-sm"><Link href={`/admin/notices/${item.id}`} className="font-semibold underline-offset-4 hover:underline">편집</Link><Link href={`/notices/${item.slug}`} className="font-semibold underline-offset-4 hover:underline">공개 보기</Link></div></li>)}</ul> : <p className="p-6 text-sm text-[var(--bw-color-muted)]">게시된 공지사항이 없습니다. 새 공지를 작성해 주세요.</p>}</section></AdminShell>;
}

export async function getServerSideProps(context) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { data: await getPublishedNoticeList("ko") } };
}
