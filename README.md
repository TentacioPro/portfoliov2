# portfoliov2: Abishek M, applied AI engineer

A static site served at https://tentaciopro.github.io/portfoliov2/. There is no framework in the browser: plain HTML, one
generated CSS file and a small script (theme switch, copy button, pause motion). Content and look are plain files:
`content/site.json`, `content/theme.json` and `content/posts/`. They are edited in **Workbench → Portfolio**
(Resume-Research/workbench) or by any coding harness; see [AGENTS.md](AGENTS.md).

## Working model
**Working model (owner's decision, 2026-09-27):** the public static page stays as it is (Soft + Ink, live on gh-pages). Admin and management are **local only**: Workbench → Portfolio on 127.0.0.1, editing the portfoliov2 working copy on branch `portfolio-v3`. No merge to `main` is needed; `main` stays the source of what is live. The site changes only if the owner chooses to deploy (Publish page, typed confirmation, or `npm run deploy`).

## Commands
| Command | What it does |
|---|---|
| `npm run build` | site.json + theme.json + published posts → `dist/` (env `SITE_JSON`, `THEME_JSON`, `POSTS_DIR`, `OUT_DIR` override) |
| `npm run dev` | build, then serve at http://127.0.0.1:4173/portfoliov2/ |
| `npm run validate` | site.json against content/schema.json and the owner's fixed rules |
| `npm run audit:facts` | the built text against FACTS (NEVER list, numbers, status labels) |
| `npm run qa` | Playwright + axe on every page at 320/390/768/1280/1440, light and dark (`CHROME=<path>` if needed) |
| `npm run qa:presets` | every style, at 390/768/1440 in its modes, with a contact sheet in `qa-shots/presets/` |
| `npm run qa:mix` | every header, hero and work part rotated through two unlike host styles |
| `npm run check` | lint + validate + build + facts audit + qa |
| `npm run deploy` | `check`, then publish `dist/` to the `gh-pages` branch (only on the owner's go) |

## Styles and parts (like WordPress themes and blocks)
- **25 styles** from the design rounds: R11 Soft + Ink (live), the ten R10 styles, six R6 and eight R5 styles.
- **Parts per slot**, usable in any style: header (8), hero (15), work list (20), frame (5), other sections (2), project page (2).
- `content/theme.json` picks a style and optionally overrides any slot, colours, fonts, display size, radius, home section
  order and visibility, and motion. See `docs/DESIGN.md` and `themes/`.

## Editing
Use Workbench → Portfolio: **Site data** (forms from the schema), **Posts**, **Appearance** (styles, parts, colours, sections,
live preview), **Sources and facts** (curate facts from the numbered docs and uploads) and **Publish** (checks, commit,
deploy). Every action is logged in the Workbench Audit trail and in `content/log.jsonl`.
The standalone `tools/writer` app was retired on 2026-09-27; Workbench replaces it.
