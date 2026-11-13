# MUNSIT AI — font files

Self-hosted with `next/font/local` (see `../fonts.ts`). Builds, the dev server and tests need no
network access. Files are the official Google Fonts WOFF2 distribution, unmodified, downloaded
2026-11-13 from the Google Fonts CSS2 API (`fonts.googleapis.com/css2?family=…&display=swap`).

Only the subsets the font stack uses are included: Cairo renders Arabic glyphs only (Latin and
numerals go to Inter by design, Design System Reference §2), Inter and Geist Mono render Latin.

| File                     | Family     | Subset | Weight axis | Google Fonts API version | Upstream project                     | License                           |
| ------------------------ | ---------- | ------ | ----------- | ------------------------ | ------------------------------------ | --------------------------------- |
| `cairo-arabic.woff2`     | Cairo      | arabic | 200–1000    | v31                      | https://github.com/Gue3bara/Cairo    | SIL OFL 1.1 — `OFL-Cairo.txt`     |
| `inter-latin.woff2`      | Inter      | latin  | 100–900     | v20                      | https://github.com/rsms/inter        | SIL OFL 1.1 — `OFL-Inter.txt`     |
| `geist-mono-latin.woff2` | Geist Mono | latin  | 100–900     | v6                       | https://github.com/vercel/geist-font | SIL OFL 1.1 — `OFL-GeistMono.txt` |

Source URLs:

- `https://fonts.gstatic.com/s/cairo/v31/SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2`
- `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2`
- `https://fonts.gstatic.com/s/geistmono/v6/or3nQ6H-1_WfwkMZI_qYFrcdmg.woff2`

License texts: `https://github.com/google/fonts/tree/main/ofl/{cairo,inter,geistmono}/OFL.txt`.

SHA-256 (enforced by `../fonts.test.ts`):

| File                     | SHA-256                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `cairo-arabic.woff2`     | `748022f50c427456ad66031e855349be3448ee1f05a5f1eb59574ebe0c686749` |
| `inter-latin.woff2`      | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |
| `geist-mono-latin.woff2` | `684ad5b531f81d43c1e8c7038262d5db7cdc1f68006e04d6c7769efa8d33c8cc` |

Rules: never edit, subset or re-encode these files. To update a font, download the new official
file, update this table and the checksums in `../fonts.test.ts`, and re-run the typography E2E
tests (they verify which font renders each glyph).

Not verified: the fonts' internal version strings (`name` table) were not read — decoding WOFF2
locally needs the Brotli Python module, which is not installed. The Google Fonts API version above
identifies the release served on the download date.
