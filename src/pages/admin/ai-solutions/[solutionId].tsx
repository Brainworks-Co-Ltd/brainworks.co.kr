import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AiSolutionForm,
  type AiSolutionFormValue,
  type BusinessAreaOption,
} from "@/components/admin/AiSolutionForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { businessAreas as publicBusinessAreas } from "@/data/businessAreas";
import { requireAdminPage } from "@/server/auth/require-admin";
import {
  getAdminAiSolution,
  listAdminBusinessAreaOptions,
} from "@/server/modules/catalog/repository";
import { HttpError } from "@/server/http/errors";

export default function EditAiSolution({
  solution,
  areas,
}: {
  solution: AiSolutionFormValue;
  areas: BusinessAreaOption[];
}) {
  return (
    <AdminShell activePath="/admin/ai-solutions">
      <AdminPageHeader
        title={solution.locales.ko.name || solution.locales.en.name || "AI 솔루션 편집"}
        description="내용과 순서를 저장한 뒤 국문과 영문을 각각 게시하거나 숨길 수 있습니다."
      />
      <div className="mt-8">
        <AiSolutionForm initial={solution} areas={areas} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const id =
    typeof context.params?.solutionId === "string"
      ? context.params.solutionId
      : "";
  try {
    const [item, areaRows] = await Promise.all([
      getAdminAiSolution(id),
      listAdminBusinessAreaOptions(),
    ]);
    const publicLabels = new Map(
      publicBusinessAreas.map((area) => [area.id, area.name.ko]),
    );
    const areas = areaRows.map((area) => ({
      id: area.id,
      publicKey: area.publicKey,
      label: publicLabels.get(area.publicKey) || area.publicKey,
    }));
    const locales = Object.fromEntries(
      item.locales.map((locale) => [
        locale.locale,
        {
          name: locale.name,
          summary: locale.summary,
          description: locale.description,
          imageAlt: locale.imageAlt || "",
          publicationStatus: locale.publicationStatus,
        },
      ]),
    ) as AiSolutionFormValue["locales"];
    return {
      props: {
        areas,
        solution: {
          id: item.id,
          version: item.version,
          itemStatus: item.itemStatus,
          businessAreaId: item.businessAreaId,
          displayOrder: item.displayOrder,
          imageAssetId: item.imageAssetId || "",
          locales,
        },
      },
    };
  } catch (error) {
    if (error instanceof HttpError && error.code === "NOT_FOUND") {
      return { notFound: true };
    }
    throw error;
  }
}
