import { sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { getDb } from "@/server/db/client";

type Transaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

export type MoveDirection = "up" | "down";

/** scope 안에서 비어 있는 다음 순서. 관리자가 숫자를 고르지 않아도 맨 뒤에 붙는다. */
export async function nextDisplayOrder(
  tx: Transaction,
  table: PgTable,
  scope: SQL,
) {
  const rows = await tx.execute<{ next: number }>(
    sql`select coalesce(max(display_order), 0) + 1 as next from ${table} where ${scope}`,
  );
  return Number(rows[0]?.next ?? 1);
}

/**
 * 같은 scope의 활성 이웃과 display_order를 맞바꾼다. 이웃이 없으면 null.
 * (scope, display_order) 유일 인덱스를 지나가기 위해 음수 임시값을 거친다.
 */
export async function swapDisplayOrder(
  tx: Transaction,
  table: PgTable,
  current: { id: string; displayOrder: number },
  scope: SQL,
  direction: MoveDirection,
) {
  const neighbors = await tx.execute<{ id: string; display_order: number }>(
    direction === "up"
      ? sql`select id, display_order from ${table} where ${scope} and item_status = 'ACTIVE' and display_order < ${current.displayOrder} order by display_order desc limit 1`
      : sql`select id, display_order from ${table} where ${scope} and item_status = 'ACTIVE' and display_order > ${current.displayOrder} order by display_order asc limit 1`,
  );
  const neighbor = neighbors[0];
  if (!neighbor) return null;
  const neighborOrder = Number(neighbor.display_order);
  await tx.execute(
    sql`update ${table} set display_order = ${-current.displayOrder} where id = ${current.id}`,
  );
  await tx.execute(
    sql`update ${table} set display_order = ${current.displayOrder} where id = ${neighbor.id}`,
  );
  await tx.execute(
    sql`update ${table} set display_order = ${neighborOrder} where id = ${current.id}`,
  );
  return { id: neighbor.id, displayOrder: neighborOrder };
}

export const moveDirectionValues = ["up", "down"] as const;
