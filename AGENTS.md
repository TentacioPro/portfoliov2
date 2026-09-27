# AGENTS.md: working on portfoliov2 with any coding harness

This is a static site (https://tentaciopro.github.io/portfoliov2/), built by `scripts/build.mjs` from plain files.
Claude Code, Codex, OpenCode, Cursor or any other harness can work on it by editing those files; the owner edits the same
files through **Workbench → Portfolio** (Resume-Research/workbench), which logs every change. There is no database.

## The files (the contract)
| File | What it holds | Checked by |
|---|---|---|
| `content/site.json` | Every piece of text on the site: profile, projects (and their pages), experiments, "also real", path, education, certification, publication, status labels, authorship line, site meta | `content/schema.json` (`npm run validate`) and the facts audit |
| `content/schema.json` | The shape of site.json. Workbench builds its forms from it (`title`, `description`, `x-widget`, `x-ref`, `x-order`, `x-fixed-keys`) | — |
| `content/theme.json` | The look: `style`, `modes`, `slots` (a part per slot, from any style), `tokens`, `font`, `home.sections` / `home.hidden`, `motion` | `themes/engine.mjs` (`resolve().errors`) |
| `content/posts/<slug>.md` | Blog posts: front matter (`title`, `date`, `updated`, `kind: written|curated`, `status: draft|published`, `summary`, `link`, `source`) + Markdown | `scripts/posts.mjs` |
| `content/log.jsonl` | Append-only change log; Workbench writes one line per action. Never rewrite earlier lines | — |
| `themes/styles/*.mjs` | Styles (presets): tokens per mode, fonts, a small skin, default part per slot. R11 (live), R10 ×10, R6 ×6, R5 ×8 | `npm run qa:presets` |
| `themes/parts/*.mjs` | Parts: `{label, from, css, render(ctx)}` per slot variant. `render` reads only `ctx.C` (site.json) | `npm run qa:mix` |

## Rules (never break these)
- **Facts only.** Every claim comes from site.json, which the owner curates from sourced facts (Workbench → Sources and facts).
  Do not invent numbers, clients, users, metrics or authorship. Parts must never hard-code text claims; they arrange site.json.
- **The facts audit is the gate** (`scripts/audit-facts.mjs`): NEVER-list strings, numbers not in site.json, status labels,
  the insurance-verification agent must stay "ready for production". Do not weaken it to make a change pass.
- **Status labels are fixed:** live, ready for production, public repo, used daily, experiment.
- **Owner's design rules:** sans by default (three R5/R6 styles keep their drawn serif display; the font control swaps it);
  the type scale 12/14/16/20/28/36 plus one display size; radii 6/10; pills only for tags; one blue focus ring #2f6fed.
- **Motion:** every looping animation sits under `.mo` (the Pause button stops it) and stops under reduced motion.
- **Base path** stays `/portfoliov2/`. No analytics, trackers, chat widgets, stock photos or live LLM on the site.
- **Never deploy without the owner's go.** `npm run deploy` publishes; Workbench asks for a typed confirmation.

## Workflow
1. Edit the files above (or queue work from Workbench: its requests land in career-ops `data/agent-inbox.md`).
2. `npm run check` (lint, validate, build, facts audit, qa at five widths in both modes). Set `CHROME=<chromium path>` if Playwright has no bundled browser.
3. After changing a style or part: `npm run qa:presets` (every style) and `npm run qa:mix` (every part inside unlike hosts).
4. Commit on a branch. Workbench notices edits made outside it and logs them in its Audit trail with a diff.

## Adding a part or a style
- **Part:** add a variant to the slot's map in `themes/parts/` (`hero`, `work`, `header` in `motion.mjs` or their own files;
  `frame`, `blocks`, `project` are CSS-only in `layout.mjs`). Use tokens (`var(--ink)`, `--bg`, `--card`, `--accent`, …),
  not fixed colours, unless the part is a physical object with its own colours (the flap board, framed placards).
- **Style:** add an entry in `themes/styles/<round>.mjs` with `modes` (light and/or dark tokens), `fonts` (names from
  `themes/fonts.mjs`), `global` (display size, weights, radius), `skin` and `defaults`. Register it in `themes/styles/index.mjs`.
- Workbench picks up new parts and styles after its server restarts.
