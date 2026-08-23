import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminHonors } from "@/server/modules/honors/repository";

export default function AdminHonors({ items }) { return <AdminShell activePath="/admin/honors"><AdminPageHeader title="수상 및 인증" description="수상·인증 콘텐츠의 순서와 공개 상태를 관리합니다." /><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">{items.length ? <ul className="divide-y divide-slate-200">{items.map((item) => <li key={item.id} className="flex justify-between py-3"><span>{item.honorType} · {item.occurredYear}</span><span className="text-sm text-slate-500">버전 {item.version}</span></li>)}</ul> : <p className="text-sm text-[var(--bw-color-muted)]">등록된 운영 수상·인증이 없습니다. 현재 공개 페이지는 승인된 정적 자료를 사용합니다.</p>}</section></AdminShell>; }
export async function getServerSideProps(context) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; return { props: { items: await listAdminHonors() } }; }
