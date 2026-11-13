import type { AppMessages } from "./messages";
import type { routing } from "./routing";

/**
 * Type-safe translations: `useTranslations` / `getTranslations` only accept existing namespaces
 * and keys (from the Arabic catalogs), and locales are typed as "ar" | "en".
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: AppMessages;
  }
}
