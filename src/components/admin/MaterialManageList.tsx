import { deleteMaterialGroup } from "@/app/actions/material";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { MaterialRow } from "@/components/admin/MaterialRow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber } from "@/lib/utils/format";
import type { MaterialRecord } from "@/lib/supabase/database.types";

/**
 * 자재명 기준으로 묶어서 자재별 카드 하나씩 보여준다. 자재 목록도 labor_records의
 * 공정과 마찬가지로 별도 테이블 없이 material_records에 실제 입력된 material_name에서
 * 유도한다.
 */
export function MaterialManageList({
  records,
  projectId,
}: {
  records: MaterialRecord[];
  projectId: string;
}) {
  if (records.length === 0) {
    return <EmptyState text="아직 등록된 자재 기록이 없습니다." />;
  }

  const groupMap = new Map<string, MaterialRecord[]>();
  for (const record of records) {
    const list = groupMap.get(record.material_name) ?? [];
    list.push(record);
    groupMap.set(record.material_name, list);
  }

  const groups = [...groupMap.entries()]
    .map(([materialName, list]) => ({
      materialName,
      unit: list[0]?.unit ?? null,
      records: [...list].sort((a, b) => a.record_date.localeCompare(b.record_date)),
    }))
    .sort((a, b) => a.materialName.localeCompare(b.materialName, "ko"));

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const usedTotal = group.records
          .filter((record) => record.type === "사용")
          .reduce((sum, record) => sum + record.quantity, 0);
        const orderedTotal = group.records
          .filter((record) => record.type === "발주")
          .reduce((sum, record) => sum + record.quantity, 0);

        const cumulativeById = new Map<string, number>();
        const running = { 사용: 0, 발주: 0 };
        for (const record of group.records) {
          running[record.type] += record.quantity;
          cumulativeById.set(record.id, running[record.type]);
        }

        const boundDeleteGroup = deleteMaterialGroup.bind(
          null,
          projectId,
          group.materialName,
        );

        return (
          <Card key={group.materialName} className="overflow-x-auto p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">
                {group.materialName}
                {group.unit && (
                  <span className="ml-1 text-xs font-normal text-ink-muted">
                    ({group.unit})
                  </span>
                )}
              </h3>
              <form action={boundDeleteGroup}>
                <DeleteButton label="자재 삭제" />
              </form>
            </div>

            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-ink-muted">
                  <th className="pb-2 font-medium">날짜</th>
                  <th className="pb-2 font-medium">구분</th>
                  <th className="pb-2 font-medium">수량</th>
                  <th className="pb-2 font-medium">누계</th>
                  <th className="pb-2 font-medium">메모</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {group.records.map((record) => (
                  <MaterialRow
                    key={record.id}
                    record={record}
                    projectId={projectId}
                    cumulative={cumulativeById.get(record.id) ?? 0}
                  />
                ))}
              </tbody>
            </table>

            <p className="mt-3 text-sm text-ink-muted">
              사용 소계:{" "}
              <span className="font-medium text-ink">
                {formatNumber(usedTotal)}
                {group.unit ?? ""}
              </span>
              {"  ·  "}
              발주 소계:{" "}
              <span className="font-medium text-ink">
                {formatNumber(orderedTotal)}
                {group.unit ?? ""}
              </span>
            </p>
          </Card>
        );
      })}
    </div>
  );
}
