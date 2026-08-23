import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getPublishedPopupNotices } from "@/server/modules/popup-notices/queries";

export default function AdminPopupNotices({ items }) { return <AdminShell activePath="/admin/popup-notices"><AdminPageHeader title="팝업 공지" description="홈에서 노출할 팝업 공지를 관리합니다. 공지사항 연결은 선택 사항입니다." action={<Link href="/admin/popup-notices/new" className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white">새 팝업 공지</Link>} /><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">{items.length ? items.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-slate-100 py-4"><span className="font-semibold">{item.title}</span><Link href={`/admin/popup-notices/${item.id}`} className="text-sm font-semibold underline">편집</Link></div>) : <p className="text-sm text-[var(--bw-color-muted)]">게시된 팝업 공지가 없습니다.</p>}</section></AdminShell>; }
export async function getServerSideProps(context) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; return { props: { items: await getPublishedPopupNotices("ko") } }; }
