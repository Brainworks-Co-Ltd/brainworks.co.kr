import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AiSolutionForm,
  createEmptyAiSolution,
  type BusinessAreaOption,
} from "@/components/admin/AiSolutionForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { businessAreas as publicBusinessAreas } from "@/data/businessAreas";
import { requireAdminPage } from "@/server/auth/require-admin";
import {
  listAdminAiSolutions,
  listAdminBusinessAreaOptions,
} from "@/server/modules/catalog/repository";

export default function NewAiSolution({
  areas,
  nextOrder,
}: {
  areas: BusinessAreaOption[];
  nextOrder: number;
}) {
  return (
    <AdminShell activePath="/admin/ai-solutions">
      <AdminPageHeader
        title="새 AI 솔루션"
        description="사업 영역을 선택하고 확인된 언어의 이름부터 초안으로 저장할 수 있습니다."
      />
      {areas.length ? (
        <div className="mt-8">
          <AiSolutionForm
            initial={createEmptyAiSolution(areas[0].id, nextOrder)}
            areas={areas}
          />
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          사용할 수 있는 사업 영역이 없습니다. 기준 데이터 반영 상태를 확인해 주세요.
        </p>
      )}
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const [areaRows, items] = await Promise.all([
    listAdminBusinessAreaOptions(),
    listAdminAiSolutions(),
  ]);
  const publicLabels = new Map(
    publicBusinessAreas.map((area) => [area.id, area.name.ko]),
  );
  const areas = areaRows.map((area) => ({
    id: area.id,
    publicKey: area.publicKey,
    label: publicLabels.get(area.publicKey) || area.publicKey,
  }));
  const firstAreaId = areas[0]?.id || "";
  const nextOrder =
    Math.max(
      0,
      ...items
        .filter((item) => item.businessAreaId === firstAreaId)
        .map((item) => item.displayOrder),
    ) + 1;
  return { props: { areas, nextOrder } };
}
