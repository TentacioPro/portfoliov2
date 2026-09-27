# portfoliov2: Abishek M, applied AI engineer

A static site served at https://tentaciopro.github.io/portfoliov2/. There is no framework in the browser: plain HTML, one CSS file, and a 1 kB script (the theme switch and the copy button). The design is Soft + Ink, with light and dark modes; see `docs/DESIGN.md`.

## Commands
| Command | What it does |
|---|---|
| `npm run build` | `src/content.js` plus published posts in `content/posts/` → `dist/` |
| `npm run dev` | build, then serve at http://127.0.0.1:4173/portfoliov2/ |
| `npm run writer` | the local writing app at http://127.0.0.1:4321 (see below) |
| `npm run audit:facts` | G3: the built text against FACTS (NEVER list, numbers, status labels) |
| `npm run qa` | Playwright and axe on every page, at 320/390/768/1280/1440, light and dark (set `CHROME` to a Chromium path if Playwright has no browser) |
| `npm run check` | lint + build + audit + qa |
| `npm run deploy` | `check`, then `gh-pages -d dist` (only on the owner's go) |

## Content
- **Every claim lives in `src/content.js`**, in the first person. Pages only arrange it.
- **Posts** are `content/posts/<slug>.md` with front matter. Only `status: published` posts are built, and Writing stays out of the navigation until there is one.

## Local writing app (`tools/writer/`)
- **Where it runs:** on 127.0.0.1 only. It is never built into `dist/` and never deployed.
- **What it does:**
  - lists drafts and published posts;
  - edits markdown with a live preview;
  - publishes or unpublishes after a confirmation;
  - runs the build.
- **The change log:** every action appends one timestamped line to `content/log.jsonl` (git-tracked).
- **Publishing:** write, publish, build, then commit and push. Only static files leave your machine.
