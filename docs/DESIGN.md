# DESIGN.md: portfolio v3

## Winner: V1 "Ledger", the owner's workbench language applied to a portfolio

The page is built around one true idea: **he connects LLM agents to real business systems and keeps them honest.** The structure carries that idea:
- **The first viewport** says who he is in one sentence and states the idea. It has the email button and a **"What is live, and what is not" ledger** in which every item carries one status colour.
- **Each case study** has four parts: what was built, what he did himself, repairs, and a "Not claimed" line.

A different person's résumé cannot fill this layout without changes. The ledger, the per-item status and the "Not claimed" lines only work with this set of facts.

The three variants are private Claude Design artboards (one canvas, three frames each): https://claude.ai/artifact/6zNLWYJfTHDC5ixi5kdq1F

| Variant | Frames | TASTE rules served | Rubric before fix (/12) | Critique (recruiter view) | Fix pass | After fix |
|---|---|---|---|---|---|---|
| **V1 Ledger** (winner) | A 1440x900, B case study open with the repairs popover, C phone 390 in dark | 1, 2, 3, 4, 5, 6, 7, 8, 12, 13 | 11 | The ledger mixed agent families and whole projects, so it read as "seven projects" ("what did they build" scored 1). | Ledger rows grouped under their project, with experiments set apart | **12** |
| V2 Seam (kintsugi) | A, B shard opened (SafeSupport), C phone | 1, 2, 3, 7 | 10 | A gold wall behind every shard is decoration, not repair, and competes for "where do I look first" (1). It needs a metaphor to decode, and moves away from the palette the owner praised. | Gold only on repair marks | 11 |
| V3 The Column (Stoicism) | A, B statement expanded, C phone | 1, 2, 3, 8 | 9, and failed the honesty gate | The email was not in the first viewport ("what do I do" scored 0). Two "Not in my control" notes were inferences not found in the facts ("when it goes live", the golden-label note). | Email moved to the top; inferred notes removed | 11 |

Rubric criteria (0 to 2 each): what is this; who is it for; what did they build; is it real; what do I do; where do I look first.

**Why V1:**
- It is the only variant that scores 12 and passes both gates without leaning on a metaphor.
- It reuses the language the owner built and praised over 21 rounds.
- Its idea (a status ledger with plain limits) is the one the owner's own research picked out as "an idea beyond skin" (Stitch finalist 3.03).

**What V1 borrows from V2:** repairs appear as a plain "Repairs" list inside each case study. There is no gold and no metaphor.

**Why the others lost:**
- **V2** reads as craft decoration before it reads as engineering, and the shards fit text poorly at 320 px.
- **V3** is honest but plain. Its "in my control / not" notes pull toward inference, which the facts rarely support.

Gates (both variants that lost are recorded here too):

| Variant | Says something | Honest |
|---|---|---|
| V1 | yes | yes |
| V2 | yes | yes |
| V3 | yes | yes after the fix |

## Tokens

### Colour, light and dark

Ratios were measured with the WCAG formula (script in `scripts/contrast.mjs`, run in G5).

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | #ece9e2 | #1a1917 | Page |
| `--panel` | #f4f2ec | #22211e | Ledger, timeline, facts panels |
| `--card` | #fbfaf6 | #2d2c28 | Project cards (lightest, soft shadow) |
| `--ink` | #1c1b18 (14.2:1 on paper) | #eeeae2 (14.6:1) | Primary text |
| `--ink2` | #4a4740 (7.6:1 paper, 8.9 card) | #bdb7ab (8.8 paper, 7.0 card) | Secondary text; never faint |
| `--line` | #d9d4c9 | #3a3833 | Structure (region separators) |
| `--edge` | #8d8677 (3.5:1 on card) | #86817a (3.1:1 on card) | Control borders at rest |
| `--strong` | = ink | = ink | Emphasis border, on hover and press only |
| `--live` pill | #185f30 on #dcefe2 (6.4:1) | #8fdcad on #1f3a29 (7.7:1) | Status "live" (green) |
| `--ready` pill | #174d8f on #dde8f6 (6.8:1) | #a9cbf5 on #1d2f47 (8.1:1) | Status "ready for production" (blue) |
| `--neutral` pill | #2b2925 on #e4e1da (11.1:1) | #e4dfd5 on #3a3833 (8.8:1) | Status "public repo" and "used daily" (ink) |
| `--exp` pill | #4f4c47 on #e6e4e0 (6.7:1) | #c9c4ba on #2e2d2a (7.9:1) | Status "experiment" (grey) |
| `--cta` | #ffffff on #b83a22 (5.7:1) | #1a1917 on #e2603f (5.0:1) | The email button only (vermilion) |
| `--focus` | #1f5fae (5.2:1 on paper) | #7fb2f0 (8.0:1 on paper) | The one focus ring |
| Selection | focus blue at 24% | focus blue at 48% | `::selection` |
| Hover | ink at 6% | ink at 10% | Row and ghost-button hover |

### Other tokens

- **Type:** six sizes only (12, 14, 16, 20, 28, 36). Body text is 16 px, controls 14 px, pill labels 12 px (bold, at least 6.4:1).
  - Font: humanist system stack (`"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial`), with no download and no Google Fonts.
  - Monospace: `ui-monospace`, used only for the email address in the copy field.
- **Spacing:** a 4 px base, using 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- **Radii:** 6 px on controls, 10 px on panels, cards and popovers, pill-shaped (999 px) tags.
- **Elevation:**
  - Cards: `0 1px 3px rgb(40 30 10 / .10)`.
  - Popovers: `0 8px 24px rgb(40 30 10 / .18)`.
  - Dark theme: the same shadows at stronger black alpha.
  - Panels have no shadow.
- **Motion:** 150 to 200 ms for opening and closing, and 2.2 s of toast dwell. All motion is off under `prefers-reduced-motion`.

## Components

- **Top bar:** name, section links, and the theme icon button (sun or moon) in the page header.
- **Hero:** one sentence, the idea, the employment line, the email button, the copy-email button, and GitHub and LinkedIn links.
- **Ledger panel:** rows grouped by project, each with a status pill, plus an "i" tip explaining how statuses are assigned.
- **Status pill:** one colour per state.
- **Project case study:** an accordion card with the name, a one-line summary and a status pill. When open it shows:
  - "What was built"
  - "What he did himself"
  - "Repairs"
  - "Not claimed"
  - a Details popover with metrics
  - the repo link where one exists
- **Popover:** opens to the right of its trigger, flips at the window edge, and closes on Esc or an outside click.
- **Also-real strip:** the ATS module and the working practice.
- **Experiments strip:** each item labelled "experiment".
- **Timeline:** newest first.
- **Education, certification and publication.**
- **Footer:** authorship line and links.
- **Toast:** "Email copied", with a border, dismissing itself.
- **Skip link.**

## Lineage: owner comment → principle → token

| Owner note | Round | Principle | Token or component |
|---|---|---|---|
| "White borders everywhere hurt focus" | 2 | Borders mean something | `--line` / `--edge` / `--strong`; emphasis only on hover, press and focus |
| "a shadow or light box conveys solidity" | 4 | Three surfaces | `--paper` < `--panel` < `--card`, with a shadow on cards only |
| "Red borders on every focused field" | 6 | Colour means state | One `--focus` blue ring, 2 px, offset 2 |
| "Selected text should not be browser blue", and "two strengths" | 11, 14 | One palette | `::selection` at 24% light and 48% dark |
| "A custom hover colour per theme" | 5 | State has one colour | Hover ink tint at 6% light and 10% dark |
| "Corners too sharp everywhere" | 13 | Soften without losing structure | 6 / 10 / pill radii |
| "Important values are too small"; "Plain text is not visible enough" | 3, 4 | Content first; contrast | Six-size scale; `--ink2` at 7:1 or more |
| "Copy message should be a highlighted animated toast" | 13 | Feedback noticed, then leaves | Bordered toast, 2.2 s |
| "Info tip opens leftward and is clipped" | 8 | Direction of reading | Popovers open rightward and flip only at the edge |
| "The 'i' already says it"; "Paragraphs too long to decide from" | 5, 20 | Progressive disclosure | Accordions and "i" popovers; one line per project in the first view |
| "Scrollbars do not match the design system" | 1, 14 | Own the scroll | Thin themed scrollbars; `color-scheme` follows the theme |
| "Kanban should carry state colour" | 4 | One colour per state | Status pills: green, blue, ink, grey |
| "résumé in ten costumes" (the Stitch v3 review) | — | Say something | Ledger and "Not claimed" structure |

## Decisions taken while the owner was asleep (the more conservative reading each time)

1. **cluBITSTranslator's status is "ready for production".** The facts do not say it is live, and a signed client alone does not prove a live deployment. "ready for production" is the weaker true-sounding label. **Owner to confirm** (open question 1).
2. **The ATS module is not given a status label.** None of the five labels is stated for it, so it sits in the timeline and the "Also real" strip as work he owned, not as a labelled project.
3. **The freelance client is not named.** "Underdogs of Madras" appears in the facts, but the NEVER list bans client names; the timeline says "Freelance full-stack developer (weekends)".
4. **The translation service the translator was positioned against is not named.** It is a third-party company; the text describes it as "a leading business translation subscription".
5. **"ready for production" is used as the label** that the facts assign to the insurance-verification agent. The site never says "in production" or "production" in any other form for that agent or the self-hosted assistant. The audit checks this.
6. **Technology and product names that appear in the facts are shown**, because they are tools he used rather than clients: ElevenLabs, Arize Phoenix, Langfuse, Groq, Azure OpenAI, Gemini, OpenRouter, Azure, Unipile, MSAL, Llama 3, vLLM, LanceDB, Neo4j. No other vendor names appear.
7. **Selection and hover tints are blue and ink, not vermilion.** The owner's workbench uses a vermilion-tinted selection, but this brief reserves vermilion for the single call to action.
8. **The old avatar photo is removed.** A photo is not among the facts.
9. **Fonts are the system stack.** No font files, no network.
10. **The LinkedIn URL keeps the slug the owner gave.** It appears only as a link target (and in llms.txt), never as visible text.
11. **Live verification.** This session's network policy blocks `tentaciopro.github.io`. The deploy is therefore verified by:
    - the GitHub "pages build and deployment" run for the exact gh-pages commit;
    - a local server that serves the gh-pages tree under `/portfoliov2/`.
12. **The deploy is a push of `dist/` to `gh-pages`.** This matches `npm run deploy`, and the Pages source is the branch. `deploy.yml` is left unchanged. It deploys through Actions, which is not the configured source, and its only earlier run failed.
