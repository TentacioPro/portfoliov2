// Validates content/site.json against content/schema.json (a small JSON Schema subset: type, properties, required,
// additionalProperties, items, pattern, maxLength) plus the owner's rules: fixed status labels, known status keys,
// unique project ids. Exported for Workbench (validate before save); run directly as a gate.
import fs from 'node:fs';
const LABELS = { live: 'live', ready: 'ready for production', repo: 'public repo', daily: 'used daily', experiment: 'experiment' };

export function validate(data, schema) {
  const errs = [];
  const walk = (v, s, at) => {
    if (!s) return;
    const t = Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
    if (s.type && s.type !== t) return errs.push(`${at || '/'}: expected ${s.type}, got ${t}`);
    if (t === 'string') {
      if (s.pattern && !new RegExp(s.pattern).test(v)) errs.push(`${at}: does not match ${s.pattern}`);
      if (s.maxLength && v.length > s.maxLength) errs.push(`${at}: longer than ${s.maxLength}`);
      if (s['x-ref'] === 'statuses' && !(v in (data.statuses || {}))) errs.push(`${at}: unknown status "${v}"`);
    }
    if (t === 'array') v.forEach((x, i) => walk(x, s.items, `${at}/${i}`));
    if (t === 'object') {
      for (const k of s.required || []) if (!(k in v)) errs.push(`${at}/${k}: required`);
      for (const [k, x] of Object.entries(v)) {
        if (s.properties?.[k]) walk(x, s.properties[k], `${at}/${k}`);
        else if (s.additionalProperties && typeof s.additionalProperties === 'object') walk(x, s.additionalProperties, `${at}/${k}`);
        else if (s.additionalProperties === false) errs.push(`${at}/${k}: unknown field`);
      }
    }
  };
  walk(data, schema, '');
  for (const [k, l] of Object.entries(LABELS)) if (data.statuses?.[k]?.label !== l) errs.push(`/statuses/${k}/label: must stay "${l}"`);
  for (const k of Object.keys(data.statuses || {})) if (!(k in LABELS)) errs.push(`/statuses/${k}: only the five fixed statuses are allowed`);
  const ids = (data.projects || []).map((p) => p.id);
  ids.forEach((id, i) => { if (ids.indexOf(id) !== i) errs.push(`/projects/${i}/id: duplicate "${id}"`); });
  return errs;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const read = (f) => JSON.parse(fs.readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8'));
  const errs = validate(read('site.json'), read('schema.json'));
  if (errs.length) { console.log(errs.join('\n')); process.exit(1); }
  console.log('content: valid');
}
