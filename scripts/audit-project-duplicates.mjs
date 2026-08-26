import { projects } from '../src/data/projects.js';

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
const scorePair = (left, right) => {
  const a = new Set([...normalize(left.title), ...normalize(left.tags.join(' ')), ...normalize(left.description)]);
  const b = new Set([...normalize(right.title), ...normalize(right.tags.join(' ')), ...normalize(right.description)]);
  const overlap = [...a].filter((token) => b.has(token)).length;
  return overlap / new Set([...a, ...b]).size;
};

const extras = projects.filter((project) => project.id.endsWith('-summary'));
const audit = extras.map((project) => {
  const baseId = project.id.replace(/-summary$/, '');
  const counterpart = projects.find((candidate) => candidate.id === baseId);
  return {
    id: project.id,
    title: project.title,
    counterpartId: counterpart?.id ?? null,
    counterpartTitle: counterpart?.title ?? null,
    similarity: counterpart ? Number(scorePair(project, counterpart).toFixed(3)) : null,
    verdict: counterpart && scorePair(project, counterpart) >= 0.2 ? 'duplicate-summary-pair' : 'standalone-rollup',
  };
});
console.log(JSON.stringify({ totalProjects: projects.length, summaryExtras: extras.length, audit }, null, 2));
