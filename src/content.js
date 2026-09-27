// All site data lives in content/site.json (edited in Workbench → Portfolio, or by any harness; schema: content/schema.json).
// This loader keeps the old named exports so the build and the facts audit read one source.
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(process.env.SITE_JSON || new URL('../content/site.json', import.meta.url), 'utf8'));
export const { statuses, person, projects, experiments, alsoReal, timeline, education, certification, publication, authorship, site } = data;
export default data;
