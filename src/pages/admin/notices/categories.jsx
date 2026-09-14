import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminNoticeCategories } from "@/server/modules/notices/category-repository";

export default function NoticeCategories({ categories }) { return <AdminShell activePath="/admin/notices"><AdminPageHeader title="공지 카테고리" description="카테고리는 삭제하지 않고 활성 상태로 관리합니다." /><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">{categories.length ? <ul className="divide-y divide-slate-200">{categories.map((category) => <li key={`${category.id}-${category.locale}`} className="flex justify-between py-3"><span>{category.name} <small className="text-slate-400">({category.locale})</small></span><span className="text-sm text-slate-500">{category.isActive ? "활성" : "비활성"}</span></li>)}</ul> : <p className="text-sm text-[var(--bw-color-muted)]">등록된 카테고리가 없습니다. API에서 국문 및 영문 이름을 함께 등록할 수 있습니다.</p>}</section></AdminShell>; }
export async function getServerSideProps(context) { const guard = await requireAdminPage(context); if ("redirect" in guard) return guard; return { props: { categories: await listAdminNoticeCategories() } }; }
