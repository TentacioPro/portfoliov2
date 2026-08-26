# Inspection notes

## AgenticLoop methodology

The referenced AgenticLoop repository defines a six-step loop: `read → red → green → gate → record → update`. It requires that tasks be specified before implementation, failing checks be written first where practical, changes remain minimal and reproducible, the full gate be run, decisions including rejected alternatives be recorded, and state be kept in committed Markdown.

## Portfolio repository

The portfolio repository is `TentacioPro/portfoliov2`, currently on `main` with remote branches `main`, `v2`, and `gh-pages`. It is a React + Vite + Tailwind + Framer Motion site with `src/App.jsx`, `src/pages/Portfolio.jsx`, `src/pages/Docs.jsx`, reusable components, and `src/data/projects.js` exporting 29 project records. Each record currently uses `image: "/images/project-placeholder.png"` and has a `/docs/*.md` download path, but `public/docs/` is absent in the current checkout.

The current app routes `/` to `Portfolio` and `/docs` to `Docs`. The repository already depends on `lucide-react`. The CSS and components still contain light/dark theme classes and a theme-toggle component, while the requested implementation must lock the site to one dark theme. The branch must be created as `manus/polish-portfolio` from `main` before coding.

## Initial decisions

Use Lucide icon names in data and resolve them through an explicit icon registry rather than storing React components in the data file. Use repository/GitHub URLs as the default `githubUrl` when no more precise project repository is identifiable, and use `null` for `liveUrl` unless an existing live deployment is discoverable in the repository. Generate local Markdown summaries from each existing description for missing downloads. Keep the existing 29 records without adding projects.
