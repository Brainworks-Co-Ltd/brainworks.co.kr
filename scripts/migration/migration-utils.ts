import fs from "node:fs";
import path from "node:path";

export type MigrationSource = { sourcePath: string; sourceChecksum: string; transformVersion: string; runId: string; contentType: string; sourceKey: string; payload: unknown };
export type MigrationSummary = { runId: string; dryRun: boolean; contentType: string; counts: { source: number; created: number; updated: number; skipped: number; unresolved: number }; sourceKeys: string[]; sourceChecksums: Record<string, string> };

export function runIdFromArgs(args = process.argv.slice(2)) { const index = args.indexOf("--run-id"); return index >= 0 && args[index + 1] ? args[index + 1] : "local-rehearsal"; }
export function isDryRun(args = process.argv.slice(2)) { return !args.includes("--apply"); }
export function reportDirectory(runId: string) { return path.join(process.cwd(), "reports", "migration", runId); }
export function ensureReportDirectory(runId: string) { fs.mkdirSync(reportDirectory(runId), { recursive: true }); return reportDirectory(runId); }
export function readSources(runId: string): MigrationSource[] { const file = path.join(reportDirectory(runId), "sources.json"); if (!fs.existsSync(file)) throw new Error(`추출 결과가 없습니다: ${file}`); return JSON.parse(fs.readFileSync(file, "utf8")) as MigrationSource[]; }
export function writeJson(file: string, value: unknown) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
export function writeUnresolved(runId: string, rows: Array<{ sourceKey: string; reason: string }>) { const content = ["sourceKey,reason", ...rows.map((row) => `${JSON.stringify(row.sourceKey)},${JSON.stringify(row.reason)}`)].join("\n"); fs.writeFileSync(path.join(reportDirectory(runId), "unresolved.csv"), `${content}\n`, "utf8"); }

export function summarize(sources: MigrationSource[], contentType: string, dryRun: boolean): MigrationSummary {
  const selected = sources.filter((source) => source.contentType === contentType);
  return { runId: selected[0]?.runId || "", dryRun, contentType, counts: { source: selected.length, created: 0, updated: 0, skipped: selected.length, unresolved: 0 }, sourceKeys: selected.map((source) => source.sourceKey), sourceChecksums: Object.fromEntries(selected.map((source) => [source.sourceKey, source.sourceChecksum])) };
}
