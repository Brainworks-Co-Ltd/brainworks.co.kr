import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminBusinessAreas } from "@/server/modules/catalog/repository";

export default function AdminAreas({ areas }) {
  return (
    <AdminShell activePath="/admin/ai-solutions/areas">
      <AdminPageHeader
        title="AI 사업 영역"
        description="홈과 솔루션 페이지가 공유하는 사업 영역을 관리합니다."
      />
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        {areas.length ? (
          <ul className="divide-y divide-slate-200">
            {areas.map((area) => (
              <li key={area.id} className="flex justify-between py-3">
                <span>{area.publicKey}</span>
                <span className="text-sm text-slate-500">
                  순서 {area.displayOrder}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--bw-color-muted)]">
            등록된 사업 영역이 없습니다.
          </p>
        )}
      </section>
    </AdminShell>
  );
}
export async function getServerSideProps(context) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { areas: await listAdminBusinessAreas() } };
}
