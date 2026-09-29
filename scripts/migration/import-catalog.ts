import { isDryRun, readSources, runIdFromArgs, summarize, writeJson, ensureReportDirectory, writeUnresolved } from "./migration-utils";

const runId = runIdFromArgs();
const dryRun = isDryRun();
const sources = readSources(runId);
const areas = summarize(sources, "catalog.area", dryRun);
const solutions = summarize(sources, "catalog.solution", dryRun);
writeJson(`${ensureReportDirectory(runId)}/catalog-summary.json`, { areas, solutions });
writeUnresolved(runId, []);
console.log(JSON.stringify({ areas, solutions }));
