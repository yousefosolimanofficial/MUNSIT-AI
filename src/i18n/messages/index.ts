/**
 * Message catalogs: one JSON file per namespace per locale (`messages/<locale>/<namespace>.json`,
 * Roadmap §3). Add a namespace by creating the file in BOTH locales and registering it below;
 * messages.test.ts fails if the two locales do not have exactly the same keys.
 *
 * Copy rules: Arabic text verbatim from Figma / Handoff only. Do not invent final copy for
 * unfinished modules. The `dev` namespace holds development-only fixtures for the temporary
 * /dev/tokens route and tests — never use it in product screens.
 */
import arCommon from "./ar/common.json";
import arDev from "./ar/dev.json";
import arErrors from "./ar/errors.json";
import arNav from "./ar/nav.json";
import arPages from "./ar/pages.json";
import arShell from "./ar/shell.json";
import enCommon from "./en/common.json";
import enDev from "./en/dev.json";
import enErrors from "./en/errors.json";
import enNav from "./en/nav.json";
import enPages from "./en/pages.json";
import enShell from "./en/shell.json";

import type { AppLocale } from "../routing";

export const MESSAGES = {
  ar: {
    common: arCommon,
    dev: arDev,
    nav: arNav,
    pages: arPages,
    errors: arErrors,
    shell: arShell,
  },
  en: {
    common: enCommon,
    dev: enDev,
    nav: enNav,
    pages: enPages,
    errors: enErrors,
    shell: enShell,
  },
} as const satisfies Record<AppLocale, Record<string, unknown>>;

/** Arabic (default locale) is the source of truth for message keys and types. */
export type AppMessages = (typeof MESSAGES)["ar"];
