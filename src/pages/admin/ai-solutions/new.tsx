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
import { listAdminBusinessAreaOptions } from "@/server/modules/catalog/repository";

export default function NewAiSolution({ areas }: { areas: BusinessAreaOption[] }) {
  return (
    <AdminShell activePath="/admin/ai-solutions">
      <AdminPageHeader
        title="새 AI 솔루션"
        description="사업 영역을 고르고 준비된 언어의 이름부터 초안으로 저장합니다. 새 솔루션은 그 영역의 맨 뒤에 들어갑니다."
      />
      {areas.length ? (
        <div className="mt-8">
          <AiSolutionForm initial={createEmptyAiSolution(areas[0].id)} areas={areas} />
        </div>
      ) : (
        <p className="mt-8 rounded-[var(--bw-radius-card)] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          사용할 수 있는 사업 영역이 없습니다. 기준 데이터 반영 상태를 확인해 주세요.
        </p>
      )}
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const areaRows = await listAdminBusinessAreaOptions();
  const publicLabels = new Map(
    publicBusinessAreas.map((area) => [area.id, area.name.ko]),
  );
  const areas = areaRows.map((area) => ({
    id: area.id,
    publicKey: area.publicKey,
    label: publicLabels.get(area.publicKey) || area.publicKey,
  }));
  return { props: { areas } };
}
