# Portfolio v3: progress log

## P0 preflight (2026-09-27)
- Tools: git, node v22.22.2, npm 10.9.7, Playwright Chromium present at /opt/pw-browsers. OK.
- Write access: `git ls-remote origin` OK; `git push --dry-run` of a throwaway ref OK; real branch pushes OK. **Tag pushes are refused by the session's git proxy (HTTP 403)**, so the two tags exist locally only; the backup branches carry the same commits.
- Claude Design (Artifact tool, "Design" type): available.
- Read-only context clones (Design-Research-Factory, Resume-Research): OK, never pushed to.
- Deploy mechanism found: Pages source is the `gh-pages` branch ("pages build and deployment" runs on gh-pages pushes). The `deploy.yml` Actions workflow on `main` failed on its only run (2026-08-26) and is not what serves the site.
- **Live-URL fetch is blocked by this session's network egress policy (tentaciopro.github.io returns 403 at the proxy).** Live verification will use the GitHub "pages build and deployment" run for the exact gh-pages commit plus a local server that mirrors the /portfoliov2/ path. Decision logged in docs/DESIGN.md.

## Gates
- G0 backups: branches `backup/gh-pages-2026-09-27` (b9fdf2f) and `backup/main-2026-09-27` (aaa9eeb) pushed; tags `pre-v3-gh-pages`, `pre-v3-main` local only (proxy refused tag push). Secret scan of tree and history: no keys, tokens or env files found. PASS (tags noted). Next: G1a TASTE.md.
- G1a TASTE.md: written from DRF 06/09/11/12/13/16/17/18, stitch/05 and RR 54/56; 15 ranked rules. PASS (2026-09-27). Next: G1b three variants in Claude Design.
- G1b variants: 3 variants x 3 frames in a private Claude Design canvas; critique + one fix pass; winner V1 Ledger 12/12, both gates pass (V2 11, V3 11). PASS (2026-09-27). Next: G2 build.

## Portfolio v3 build (2026-09-27, after design round 11)
- **Design:** Soft + Ink, light and dark (Design-Research-Factory `design/portfolio-v3/rounds/r11`). The earlier G1b winner (V1 Ledger) was rejected by the owner and is superseded.
- **G2 build:** the React/Tailwind app was replaced by a static build (`scripts/build.mjs`): home, four project pages, Writing (hidden until the first published post), posts, 404, sitemap, robots. PASS.
- **G3 facts audit:** `npm run audit:facts`. PASS.
- **G4/G5 QA:** `npm run qa`: 70 checks (7 pages × 5 widths × 2 themes), 0 axe issues, 0 overflow, 0 tiny text. PASS.
- **Writer:** `npm run writer` (local only). Tested end to end: create, publish and build made Writing appear; the test post and its log lines were then removed.
- **G6 deploy:** NOT DONE. Waiting on the owner's go. Backups: `backup/main-2026-09-27`, `backup/gh-pages-2026-09-27`.
- **G6 deploy: DONE 2026-09-27.** `main` fast-forwarded to `portfolio-v3` (old main kept as `backup/main-pre-v3` and `backup/main-2026-09-27`). Published with `npm run deploy` (all gates rerun: lint, build, facts audit, qa 70/70) to `gh-pages` (commit 692b944; old site kept as `backup/gh-pages-2026-09-27`). GitHub's "pages build and deployment" run succeeded.
- **Publishing:** Pages serves from the `gh-pages` branch. The Actions deploy job was dropped (2026-09-27); `.github/workflows/ci.yml` now only installs, lints and builds on pushes to main. Publish with `npm run deploy`, which reruns every gate first. Stray files from the old site (`.eslintrc.cjs`, `.gitignore`) were removed from `gh-pages`.
