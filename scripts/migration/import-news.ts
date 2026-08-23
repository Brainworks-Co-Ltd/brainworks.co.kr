import { isDryRun, readSources, runIdFromArgs, summarize, writeJson, ensureReportDirectory, writeUnresolved } from "./migration-utils";

const runId = runIdFromArgs();
const dryRun = isDryRun();
const sources = readSources(runId);
const summary = summarize(sources, "news", dryRun);
writeJson(`${ensureReportDirectory(runId)}/news-summary.json`, summary);
writeUnresolved(runId, []);
console.log(JSON.stringify(summary));
