> Superseded 2026-09-27: the owner's final design is Soft + Ink (see docs/DESIGN.md). Kept for history.

# TASTE.md: the owner's design taste, as rules

Written 2026-09-27 before any design work on portfolio v3. Sources are the owner's two private research repos, read-only:
- **Design-Research-Factory** (DRF): docs 06, 09, 11, 12, 13, 16, 17, 18, `stitch/05_V3_REVIEW_AND_LAYER_PROMPTS.md`.
- **Resume-Research** (RR): doc 56 (the design-language decision log, 21 review rounds) and doc 54 (the per-round review tables).

Only the design lessons are copied here. No private facts are.

## 1. Taste rules, ranked

| # | Rule | Evidence |
|---|---|---|
| 1 | **Say something; do not dress a résumé.** The layout must carry an idea that is true of this person, and another person's résumé must not fit it unchanged. | DRF 13 §3b and `stitch/05` "Same content everywhere means skins differ, ideas do not"; the owner called the ten Stitch variants "just my resume context scattered". |
| 2 | **Honest status, stated plainly.** Every project says whether it is live, and a limit counts as content, not as something to hide. | DRF 11 Seam ("candid moves how status is stated"); DRF 06 §2a "Stated limits"; `stitch/05` finalist 3.03 was chosen for "a status ledger beside each project". |
| 3 | **Content is the loudest thing; chrome is quiet.** | RR 56 §1 and principle "Content first"; round 3: "Important values are too small on every page". |
| 4 | **State is told with colour, one colour per state, the same everywhere.** | RR 56 principle "State has one colour each"; rounds 4 and 6 (kanban hue; "red reserved for the ready state"). |
| 5 | **Borders mean something.** Three strengths (structure, control at rest, emphasis), and emphasis appears only on hover, press or focus. | RR 56 round 2: "White borders everywhere hurt focus"; rounds 5, 6 and 9 (double highlight, white border box). |
| 6 | **Three surfaces.** Page, then panel, then card; cards are lightest and carry a soft shadow so they read as solid objects. | RR 56 round 4: "a shadow or light box conveys solidity". |
| 7 | **Progressive disclosure.** Detail lives one click away in popovers, accordions or "i" tips, never as a wall of paragraphs. | RR 56 rounds 3, 5 and 20: "the 'i' already says it"; "Paragraphs are too long to decide from". |
| 8 | **Text is never small and faint.** Six sizes (12, 14, 16, 20, 28, 36); secondary text keeps real contrast. | RR 56 rounds 3, 4 and 16: "Plain text is not visible enough"; `stitch/05`: rejects 9 to 11 px text and requires every pair at 4.5:1 or more. |
| 9 | **One blue focus ring, a single ring; red never marks focus.** | RR 56 round 6: "Red borders on every focused field"; round 9: "Double highlight". |
| 10 | **Nothing looks like a browser default.** Styled controls, tooltips, scrollbars, selection and hover. | RR 56 rounds 1, 5, 11 and 14 (dropdowns, date popup, selection "not browser blue", scrollbars). |
| 11 | **Every width; own the scroll.** No page cap, no sideways page scroll, internal regions scroll and the frame stays put. | RR 56 rounds 1, 4 and 14 ("The sidebar does not need to scroll, only its menu"). |
| 12 | **Softly rounded.** 6 px on controls, 10 px on panels, pill tags. | RR 56 round 13: "Corners too sharp everywhere". |
| 13 | **Information flows right.** Panels open rightward and flip only at the window edge. | RR 56 round 8: "Info tip opens leftward and is clipped". |
| 14 | **Feedback is noticed, then leaves.** A short toast with a border that dismisses itself. | RR 56 round 13: "Copy message should be a highlighted animated toast". |
| 15 | **Keyboard-first, motion optional.** Everything is reachable, Esc closes popovers, and the page works with motion off. | RR 56 "Nothing hidden needs the mouse"; DRF 06 P13. |

## 2. What he rejected, and why

- **"Résumé in ten costumes"** (DRF 13 §3b, `stitch/05`): ten Stitch variants and twenty wireframes locked one content block and varied only the skin. None felt owned.
- **Magazine layouts with résumé fragments**: fragments arranged as décor say nothing about the work.
- **Generic card grids**: same-size icon cards, hero-metric strips, gradient text and glassmorphism (DRF 06 §2b "Design that says nothing").
- **Invented or leaked copy** (`stitch/05`): Stitch rewrote lines and leaked labels ("Spread 01", "01 / ARCHITECTURE" eyebrows). Every claim must trace to a fact file.
- **White outlines everywhere, red focus, browser-blue selection, unstyled popups** (RR 56 rounds 2, 5, 6, 11).
- **Serif body text** ("Serif looks worse", RR 56 round 5): a humanist sans is used instead.

## 3. What he praised or built himself

His job-search workbench (RR 56 §1): *"calm, softly rounded, editorial-technical … Content is the loudest thing on screen; chrome is quiet. State is told with colour, not with more borders. Everything that is not needed right now lives one click away."* It was built over 21 review rounds: he reviewed from screenshots, tied each note to a principle, and had each fix measured in the browser. That method is itself part of his taste: **judge by measurement, not by adjectives.** From the research he kept Seam (a real repair made visible) and 3.03's status ledger, both of which carry an idea beyond the skin (DRF 12 §3, `stitch/05`).

## 4. The three questions a recruiter must answer in 30 seconds

1. **Who is he and what does he build?** Applied AI engineer: agentic systems wired to real business data.
2. **Is it real?** Which work is live, which is ready but not live, which is a public repo, which is an experiment.
3. **How do I reach him?** One email action, visible without scrolling.

(DRF 06 §3, the skim test; DRF 17 selection rubric; this prompt's own rubric.)

## 5. How each rule changes a portfolio layout

| Rule | In practice on this site |
|---|---|
| 1 Say something | The page is organised around one true idea (agents connected to real systems, kept honest), not around résumé sections. The status ledger and the "not claimed" lines are the structure. |
| 2 Honest status | Every project carries exactly one status pill. Each case study has a "Not claimed" line, and a ledger lists live against not live. |
| 3 Content loudest | The project name and status are the biggest things in each row; the chrome is a thin top bar with the name, a theme icon and email. |
| 4 One colour per state | Green = live, blue = ready for production, ink = public repo and used daily, grey = experiment. Vermilion appears only on the email button. |
| 5 Borders mean something | `--line` separates regions, `--edge` outlines controls at rest, `--ink-border` appears on hover and press; there are no decorative outlines. |
| 6 Three surfaces | Paper page, panel for the ledger and timeline, cards for the projects (lightest, with a soft shadow). |
| 7 Disclosure | Case studies are accordions; metrics and architecture notes are popovers or "i" tips. The first viewport shows one line per project. |
| 8 Type | Only 12, 14, 16, 20, 28 and 36 px; body text 16; secondary ink measured at AA or better in both themes. |
| 9 Focus | One 2 px blue outline with offset, on every control. |
| 10 No defaults | Custom buttons, tooltips, thin scrollbars, selection tint (24% light, 48% dark) and hover tint. |
| 11 Widths | A fluid grid from 320 px to wide screens, no max-width cap on the frame, and long lists scroll inside their own region. |
| 12 Rounded | Controls 6 px, panels 10 px, pills fully rounded. |
| 13 Rightward | Popovers open to the right of their trigger and flip at the edge. |
| 14 Toast | "Email copied": a bordered toast, 2.2 s, reduced to no motion when reduced motion is set. |
| 15 Keyboard | Skip link, landmarks, `aria-expanded`, and Esc closes popovers. |
