import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('specs/assets/lighthouse-report.json', 'utf8'));
const failing = Object.values(report.audits)
  .filter((audit) => audit.score !== null && audit.score < 1)
  .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
  .map((audit) => ({ id: audit.id, title: audit.title, score: audit.score, displayValue: audit.displayValue, explanation: audit.explanation }));
const detailIds = ['color-contrast', 'errors-in-console', 'meta-description'];
const details = Object.fromEntries(detailIds.map((id) => [id, {
  score: report.audits[id]?.score,
  details: report.audits[id]?.details,
  explanation: report.audits[id]?.explanation,
}]));
console.log(JSON.stringify({
  categories: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, value.score])),
  failing,
  details,
}, null, 2));
