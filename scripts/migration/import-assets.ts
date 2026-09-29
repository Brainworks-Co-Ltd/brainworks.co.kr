import { isDryRun, readSources, runIdFromArgs, summarize, writeJson, ensureReportDirectory, writeUnresolved } from "./migration-utils";

const runId = runIdFromArgs();
const dryRun = isDryRun();
const sources = readSources(runId);
const summary = summarize(sources, "asset.image", dryRun);
writeJson(`${ensureReportDirectory(runId)}/assets-summary.json`, summary);
writeUnresolved(runId, []);
console.log(JSON.stringify(summary));
