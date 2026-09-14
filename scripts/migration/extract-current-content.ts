import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { getAllNewsMeta, getNewsDetail } from "@/lib/news";
import { businessAreas } from "@/data/businessAreas";
import awardsData from "@/utils/awardsData";
import certificationsData from "@/utils/certificationsData";
import { ensureReportDirectory, reportDirectory, runIdFromArgs, writeJson, type MigrationSource } from "./migration-utils";

const runId = runIdFromArgs();
const transformVersion = "2026-08-24.v1";
const sources: MigrationSource[] = [];
function add(source: Omit<MigrationSource, "sourceChecksum" | "runId" | "transformVersion">) { const raw = JSON.stringify(source.payload); sources.push({ ...source, sourceChecksum: createHash("sha256").update(raw).digest("hex"), runId, transformVersion }); }

for (const area of businessAreas) { add({ sourcePath: "src/data/businessAreas.js", contentType: "catalog.area", sourceKey: area.id, payload: area }); for (const solution of area.solutions) add({ sourcePath: "src/data/businessAreas.js", contentType: "catalog.solution", sourceKey: `${area.id}:${solution.id}`, payload: { areaId: area.id, solution } }); }
for (const item of awardsData) add({ sourcePath: "src/utils/awardsData.js", contentType: "honor.award", sourceKey: item.slug, payload: item });
for (const item of certificationsData) add({ sourcePath: "src/utils/certificationsData.js", contentType: "honor.certification", sourceKey: item.slug, payload: item });
for (const item of getAllNewsMeta()) { const detail = getNewsDetail(item.slug); add({ sourcePath: path.join("src/content/news", `${item.slug}.md`), contentType: "news", sourceKey: item.slug, payload: detail }); if (item.thumbnail) add({ sourcePath: item.thumbnail, contentType: "asset.image", sourceKey: item.thumbnail, payload: { path: item.thumbnail } }); }
const directory = ensureReportDirectory(runId); writeJson(path.join(directory, "sources.json"), sources); writeJson(path.join(directory, "checksums.json"), Object.fromEntries(sources.map((source) => [source.sourceKey, source.sourceChecksum]))); writeJson(path.join(directory, "summary.json"), { runId, transformVersion, sourceCount: sources.length, contentTypes: [...new Set(sources.map((source) => source.contentType))] });
console.log(JSON.stringify({ runId, sourceCount: sources.length, reportDirectory: directory }));
