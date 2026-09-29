import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminPopupNoticeList } from "@/server/modules/popup-notices/queries";

const publicationStatusLabel = { DRAFT: "초안", SCHEDULED: "예약 게시", PUBLISHED: "게시 중", UNPUBLISHED: "게시 중단" };

export default function AdminPopupNotices({ items }) { return <AdminShell activePath="/admin/popup-notices"><AdminPageHeader title="팝업 공지" description="홈에서 노출할 팝업 공지를 관리합니다. 공지사항 연결은 선택 사항입니다." action={<Link href="/admin/popup-notices/new" className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white">새 팝업 공지</Link>} /><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">{items.length ? items.map((item) => <div key={item.id} className="flex flex-col gap-2 border-b border-slate-100 py-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs text-[var(--bw-color-muted)]">한국어 {publicationStatusLabel[item.locales.ko?.publicationStatus] || "없음"}, English {publicationStatusLabel[item.locales.en?.publicationStatus] || "없음"}</p><span className="font-semibold">{item.locales.ko?.title || item.locales.en?.title || "제목 없음"}</span></div><Link href={`/admin/popup-notices/${item.id}`} className="text-sm font-semibold underline">편집</Link></div>) : <p className="text-sm text-[var(--bw-color-muted)]">등록된 팝업 공지가 없습니다.</p>}</section></AdminShell>; }
export async function getServerSideProps(context) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; return { props: { items: await getAdminPopupNoticeList() } }; }
