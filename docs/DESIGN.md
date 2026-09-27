# Design: Soft + Ink (portfolio v3)

Picked by the owner in round 11 of the design record (Design-Research-Factory, `design/portfolio-v3/rounds/r11`).

**Modes:**
- **Light is Soft:** raised surfaces, soft shadows, no outlines.
- **Dark is Ink:** a black page with hairlines instead of shadows.

The page follows the system setting until the visitor uses the switch in the header. The choice is stored in `localStorage` and applied before first paint.

## Tokens (`src/site.css`)
| Token | Light | Dark |
|---|---|---|
| `--bg` | #e8ebef | #0b0b0c |
| `--card` | #eef1f4 | #141416 |
| `--ink` | #16191d | #f2f2f0 |
| `--sub` | #4c545e | #a3a39e |
| `--sh` | 6px 6px 16px #cfd4db, -6px -6px 16px #fbfcfd | 0 0 0 1px #242427 |
| live | #d9f0e1 / #0f5c34 | #123a24 / #8fe0ae |
| ready for production | #dce6f7 / #1c4a94 | #15294a / #a9c4f5 |
| public repo, used daily | #e0e3e8 / #353b43 | #232325 / #d6d6d2 |
| experiment | #f6ead2 / #6e4406 | #3a2a0e / #f2c879 |

**Shared rules:**
- **Type:** Manrope, on the scale 12/14/16/20/28/36 plus one display size, `clamp(40px, 6vw, 72px)`.
- **Shape:** radii 6 and 10; pills only for status tags.
- **Focus:** one blue focus ring (2px #2f6fed, 3px offset).
- **Motion:** a 2px lift on tiles, 0.2s; nothing else moves. Reduced motion turns it off.

## Components
- **Header:** the name; a pill navigation bar with the active tab pressed in (Work and About, plus Writing once a post is published); socials; the theme switch. On phones the navigation takes its own row and the socials move to the footer.
- **Buttons:**
  - Email: ink fill.
  - Copy address: a raised surface, which turns green and reads "Copied" for 2s. It is announced to screen readers.
- **Status tag:** a pill with a dot and one of the five labels in `src/content.js`.
- **Project tile:** status, name, key value (36px), label, one line, and a link to the project page.

## Pages
| Page | Path |
|---|---|
| Home | `/` |
| Project pages | `/work/<id>/` (status, one line, numbers, what I built, how it was checked, families, not claimed, link) |
| Writing index | `/writing/` (empty state until the first published post; year groups; Written and Curated labels) |
| Posts | `/writing/<slug>/` |
| Not found | `404.html` |
