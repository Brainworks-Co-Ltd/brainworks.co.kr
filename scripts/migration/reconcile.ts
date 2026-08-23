import fs from "node:fs";
import path from "node:path";
import { readSources, reportDirectory, runIdFromArgs, writeJson } from "./migration-utils";

export function reconcileSources(sources: Array<{ sourceKey: string; sourceChecksum: string }>, imported: Array<{ sourceKey: string; sourceChecksum: string }>) {
  const importedByKey = new Map(imported.map((item) => [item.sourceKey, item.sourceChecksum]));
  const unresolved = sources.filter((source) => importedByKey.get(source.sourceKey) !== source.sourceChecksum).map((source) => ({ sourceKey: source.sourceKey, reason: importedByKey.has(source.sourceKey) ? "CHECKSUM_MISMATCH" : "NOT_IMPORTED" }));
  return { sourceCount: sources.length, importedCount: imported.length, unresolved };
}

export function runReconcile(runId = runIdFromArgs()) {
  const sources = readSources(runId);
  const directory = reportDirectory(runId);
  const summaryFiles = fs.readdirSync(directory).filter((file) => file.endsWith("-summary.json"));
  const imported = summaryFiles.flatMap((file) => {
    const value = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
    const candidates = [value, ...Object.values(value)];
    const summaries = candidates.filter((item): item is { sourceKeys?: string[]; sourceChecksums?: Record<string, string> } => Boolean(item && typeof item === "object" && "sourceKeys" in item));
    return summaries.flatMap((item) => (item.sourceKeys || []).map((sourceKey) => ({ sourceKey, sourceChecksum: item.sourceChecksums?.[sourceKey] || "" })));
  });
  const result = reconcileSources(sources, imported);
  writeJson(path.join(directory, "reconcile.json"), result);
  return result;
}

if (process.argv[1]?.endsWith("reconcile.ts")) console.log(JSON.stringify(runReconcile()));
