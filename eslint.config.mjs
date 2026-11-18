import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Import cycles and module-boundary rules are enforced by dependency-cruiser
// (.dependency-cruiser.cjs), which runs as part of `pnpm lint`.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Phase 06 navigation guard (D-U7): code-driven navigation must go through
  // useGuardedRouter, so an active guard can ask first. Only the guard itself may use the raw
  // routers. Tests mock the modules instead of importing them.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/shared/hooks/useNavigationGuard.ts",
      "src/shared/patterns/NavigationGuardProvider.tsx",
      "src/**/*.test.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/i18n/navigation",
              importNames: ["useRouter"],
              message:
                "Use useGuardedRouter from @/shared/hooks/useNavigationGuard (Phase 06 navigation guard).",
            },
            {
              name: "next/navigation",
              importNames: ["useRouter"],
              message:
                "Use useGuardedRouter from @/shared/hooks/useNavigationGuard (Phase 06 navigation guard).",
            },
            { name: "next/router", message: "The Pages Router is not used (App Router only)." },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
