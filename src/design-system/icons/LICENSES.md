# MUNSIT AI icons — provenance and licenses

Investigated 2026-11-13 (Phase 02 step 5). The MUNSIT icon library in Figma is **not original
artwork**: 38 of the 40 icons are geometrically identical to icons from
the open-source **Lucide** project (several of which Lucide itself derives from **Feather**).

## Method

Each exported icon (`./svg/*.svg`) and each candidate upstream icon was rendered in Chromium at
96 px with the same stroke (1.75) and compared pixel by pixel (intersection over union of the
drawn pixels; 1.00 = identical drawing). Upstream files were read from the official repositories
`lucide-icons/lucide` (tags 0.300.0, 0.400.0, 0.460.0 and `main`) and `feathericons/feather`
(`main`). An icon is recorded as **derived** at IoU ≥ 0.95.

## Licenses

- **Lucide** — ISC License, © Lucide Icons and Contributors. Full text: `./LICENSE-lucide.txt`
  (verbatim copy of the upstream `LICENSE`).
- **Feather** — MIT License, © Cole Bemis. Its notice is part of `./LICENSE-lucide.txt`, which
  lists the Lucide icons derived from Feather.

Both licenses allow use and modification provided the copyright and permission notices are kept
with copies. MUNSIT modifications: stroke width 2 → 1.75 (Figma design), color → `currentColor`.
Lucide is **not** installed as a dependency; only the geometry from the Figma file is used.

## Per icon

| Icon        | Upstream match (best)                              | IoU  | Status                                           |
| ----------- | -------------------------------------------------- | ---- | ------------------------------------------------ |
| home        | Lucide `home` 0.300.0 · Feather `home`             | 1.00 | Derived                                          |
| book        | Lucide `book-open` 0.300–0.400 · Feather           | 1.00 | Derived                                          |
| fileText    | Lucide `file-text`                                 | 0.97 | Derived                                          |
| help        | Feather `help-circle` · Lucide `circle-help`       | 1.00 | Derived                                          |
| note        | Lucide `sticky-note`                               | 0.96 | Derived                                          |
| star        | Lucide `star` 0.300–0.400 · Feather                | 1.00 | Derived                                          |
| folder      | Lucide `folder`                                    | 1.00 | Derived                                          |
| search      | Lucide / Feather `search`                          | 0.99 | Derived                                          |
| bell        | Lucide `bell` 0.300–0.460                          | 1.00 | Derived                                          |
| moon        | Lucide `moon` 0.300–0.460                          | 0.99 | Derived                                          |
| chevDown    | Lucide / Feather `chevron-down`                    | 1.00 | Derived                                          |
| upload      | Lucide / Feather `upload`                          | 1.00 | Derived                                          |
| cloudUpload | Lucide `upload-cloud` 0.300.0                      | 0.98 | Derived                                          |
| play        | Lucide `play` 0.400–0.460                          | 1.00 | Derived                                          |
| check       | Lucide / Feather `check`                           | 1.00 | Derived                                          |
| clock       | Lucide / Feather `clock`                           | 1.00 | Derived                                          |
| target      | Lucide / Feather `target`                          | 1.00 | Derived                                          |
| message     | Lucide `message-circle` 0.300–0.460                | 0.97 | Derived                                          |
| download    | Lucide / Feather `download`                        | 1.00 | Derived                                          |
| sparkles    | Lucide `sparkle` 0.300.0                           | 1.00 | Derived                                          |
| alert       | Lucide `alert-triangle` 0.300.0                    | 1.00 | Derived                                          |
| crown       | Lucide `crown` 0.300.0                             | 1.00 | Derived                                          |
| menu        | Lucide `menu` 0.300–0.460                          | 1.00 | Derived                                          |
| x           | Lucide / Feather `x`                               | 1.00 | Derived                                          |
| user        | Lucide `user`                                      | 1.00 | Derived                                          |
| settings    | Lucide `settings` 0.300–0.460                      | 0.99 | Derived                                          |
| logout      | Lucide / Feather `log-out`                         | 1.00 | Derived                                          |
| more        | Lucide `ellipsis` · Feather `more-horizontal`      | 1.00 | Derived                                          |
| trending    | Lucide `trending-up`                               | 1.00 | Derived                                          |
| network     | Lucide `network`                                   | 1.00 | Derived                                          |
| box         | Lucide `box`                                       | 1.00 | Derived                                          |
| sigma       | Lucide `sigma`                                     | 1.00 | Derived                                          |
| cpu         | Lucide `cpu` 0.300.0                               | 1.00 | Derived                                          |
| checkSquare | Feather `check-square` · Lucide `square-check-big` | 1.00 | Derived                                          |
| mic         | Lucide `mic`                                       | 1.00 | Derived                                          |
| file        | Lucide `file`                                      | 0.97 | Derived                                          |
| arrowLeft   | Lucide / Feather `arrow-left`                      | 1.00 | Derived                                          |
| lightbulb   | Lucide `lightbulb`                                 | 1.00 | Derived                                          |
| slides      | none (closest Lucide `monitor` / `presentation`)   | 0.59 | **Source unconfirmed** — no upstream match found |
| cards       | none (Figma layers "Card Front" / "Card Back")     | 0.06 | **Source unconfirmed** — no upstream match found |

Not verified: whether the designer copied Lucide directly or through a Figma community kit; the
geometry match is the evidence. `slides` and `cards` matched no icon in the sets checked (Lucide
0.300.0 / 0.400.0 / 0.460.0 / main, Feather main); that does not prove they are original MUNSIT
artwork — other libraries or versions were not checked. Treat their source as **unconfirmed**
until the designer confirms it. Attribution in the running app (e.g. a credits page) is not
required by the license text beyond keeping the notices with the source; decide in a later phase.
