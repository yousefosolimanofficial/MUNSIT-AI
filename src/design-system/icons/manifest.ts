/**
 * MUNSIT AI — official icon library manifest (Phase 02 step 5).
 *
 * Source: Figma components `Icon / <name>` — 39 in `Dashboard / Components` (2205:12, page 03)
 * and `Icon / slides` (2278:291, page 05). All are 24×24 outline icons, stroke 1.75, no fill.
 * Geometry: ./svg/*.svg and ./geometry.generated.ts (imported by scripts/import-figma-icons.mjs).
 * Inventory, placements and licensing: docs/design-values.md §2b, ./LICENSES.md.
 *
 * Direction: the Figma file is drawn natively for RTL, so icons render exactly as drawn in
 * Arabic. `mirrorInLtr` flips an icon horizontally in LTR (English) only. Approved by the user
 * 2026-11-13: only `arrowLeft` mirrors; `logout` and `play` never mirror; any other directional
 * icon is reviewed individually before being added here.
 */

export interface IconMeta {
  /** Figma component node id. */
  figmaNode: string;
  /** Flip horizontally in LTR. RTL always renders the Figma drawing unchanged. */
  mirrorInLtr: boolean;
  /** Where the design uses it (FIGMA inventory, 2026-11-13). */
  usage: string;
}

export const ICON_MANIFEST = {
  home: { figmaNode: "2205:17", mirrorInLtr: false, usage: "Nav الرئيسية" },
  book: { figmaNode: "2205:22", mirrorInLtr: false, usage: "Nav محاضراتي; lecture items" },
  fileText: { figmaNode: "2205:30", mirrorInLtr: false, usage: "Nav الملخصات; summaries" },
  help: { figmaNode: "2205:36", mirrorInLtr: false, usage: "Nav الأسئلة; questions" },
  note: { figmaNode: "2205:41", mirrorInLtr: false, usage: "Nav الملاحظات; notes" },
  star: { figmaNode: "2205:45", mirrorInLtr: false, usage: "Nav المفضلة; favorite toggle" },
  folder: { figmaNode: "2205:49", mirrorInLtr: false, usage: "Nav المجلدات; folders" },
  search: { figmaNode: "2205:54", mirrorInLtr: false, usage: "Top Bar search; module search" },
  bell: { figmaNode: "2205:59", mirrorInLtr: false, usage: "Notifications button" },
  moon: { figmaNode: "2205:63", mirrorInLtr: false, usage: "Theme toggle" },
  chevDown: { figmaNode: "2205:67", mirrorInLtr: false, usage: "User menu trigger, selects" },
  upload: { figmaNode: "2205:73", mirrorInLtr: false, usage: "Create / upload buttons" },
  cloudUpload: { figmaNode: "2205:79", mirrorInLtr: false, usage: "Upload lecture drop zone" },
  play: { figmaNode: "2205:83", mirrorInLtr: false, usage: "Media play (never mirrored)" },
  check: { figmaNode: "2205:87", mirrorInLtr: false, usage: "Success, selected, correct" },
  clock: { figmaNode: "2205:92", mirrorInLtr: false, usage: "Duration, saving, waiting" },
  target: { figmaNode: "2205:98", mirrorInLtr: false, usage: "Quiz score stat, upload option" },
  message: { figmaNode: "2205:102", mirrorInLtr: false, usage: "AI questions stat, AI messages" },
  download: { figmaNode: "2205:108", mirrorInLtr: false, usage: "Download actions" },
  sparkles: { figmaNode: "2205:112", mirrorInLtr: false, usage: "AI features" },
  alert: { figmaNode: "2205:118", mirrorInLtr: false, usage: "Errors and warnings" },
  crown: { figmaNode: "2205:123", mirrorInLtr: false, usage: "Plan upgrade" },
  menu: { figmaNode: "2205:129", mirrorInLtr: false, usage: "Tablet Rail menu button" },
  x: { figmaNode: "2205:134", mirrorInLtr: false, usage: "Close dialogs, sheets, panels" },
  user: { figmaNode: "2205:139", mirrorInLtr: false, usage: "User menu, profile" },
  settings: { figmaNode: "2205:144", mirrorInLtr: false, usage: "Settings entries" },
  logout: { figmaNode: "2205:150", mirrorInLtr: false, usage: "Log out (never mirrored)" },
  more: { figmaNode: "2205:156", mirrorInLtr: false, usage: "Mobile bar المزيد; item menus" },
  trending: { figmaNode: "2205:161", mirrorInLtr: false, usage: "Not used on any Figma page" },
  network: { figmaNode: "2205:169", mirrorInLtr: false, usage: "Course card icon" },
  box: { figmaNode: "2205:175", mirrorInLtr: false, usage: "Course card icon" },
  sigma: { figmaNode: "2205:179", mirrorInLtr: false, usage: "Course card icon" },
  cpu: { figmaNode: "2205:185", mirrorInLtr: false, usage: "Course card icon" },
  checkSquare: { figmaNode: "2205:190", mirrorInLtr: false, usage: "Key-points summary type" },
  mic: { figmaNode: "2205:196", mirrorInLtr: false, usage: "Recording, microphone" },
  file: { figmaNode: "2205:201", mirrorInLtr: false, usage: "Selected file" },
  arrowLeft: { figmaNode: "2205:206", mirrorInLtr: true, usage: "Forward/next action links" },
  lightbulb: { figmaNode: "2205:212", mirrorInLtr: false, usage: "Simplify / explain actions" },
  cards: { figmaNode: "2749:4836", mirrorInLtr: false, usage: "Nav البطاقات التعليمية" },
  slides: { figmaNode: "2278:291", mirrorInLtr: false, usage: "Lecture slides tab" },
} as const satisfies Record<string, IconMeta>;

export type IconName = keyof typeof ICON_MANIFEST;

export const ICON_NAMES = Object.keys(ICON_MANIFEST) as IconName[];

/** Native size of every icon in Figma (px). */
export const ICON_NATIVE_SIZE = 24;

/**
 * Rendered sizes read from Figma placements (px). Other contexts use the size of their own
 * Figma placement (12–32 px observed) — pass it as a number; do not invent new presets.
 */
export const ICON_SIZES = {
  sidebar: 20,
  rail: 20,
  mobileNav: 22,
  moreSheet: 18,
} as const;
