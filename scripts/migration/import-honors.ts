import { isDryRun, readSources, runIdFromArgs, summarize, writeJson, ensureReportDirectory, writeUnresolved } from "./migration-utils";

const runId = runIdFromArgs();
const dryRun = isDryRun();
const sources = readSources(runId);
const awards = summarize(sources, "honor.award", dryRun);
const certifications = summarize(sources, "honor.certification", dryRun);
writeJson(`${ensureReportDirectory(runId)}/honors-summary.json`, { awards, certifications });
writeUnresolved(runId, []);
console.log(JSON.stringify({ awards, certifications }));
