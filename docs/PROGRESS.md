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
