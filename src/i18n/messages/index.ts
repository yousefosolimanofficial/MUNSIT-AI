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
import enCommon from "./en/common.json";
import enDev from "./en/dev.json";

import type { AppLocale } from "../routing";

export const MESSAGES = {
  ar: { common: arCommon, dev: arDev },
  en: { common: enCommon, dev: enDev },
} as const satisfies Record<AppLocale, Record<string, unknown>>;

/** Arabic (default locale) is the source of truth for message keys and types. */
export type AppMessages = (typeof MESSAGES)["ar"];
