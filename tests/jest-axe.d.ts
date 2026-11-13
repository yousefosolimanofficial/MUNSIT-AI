/**
 * Minimal local types for `jest-axe` (the package ships none). `@types/jest-axe` is deliberately
 * not installed: it depends on `@types/jest` and on `axe-core` 3.x (ADR-001, Phase 03).
 *
 * Usage in component tests (Vitest, `// @vitest-environment jsdom`):
 *   expect((await axe(container)).violations).toEqual([]);
 * jsdom does not compute rendered colors, so axe's color-contrast rule cannot be trusted there;
 * contrast is checked from tokens and in a real browser instead.
 */
declare module "jest-axe" {
  export interface AxeViolation {
    id: string;
    impact?: string | null;
    help: string;
    helpUrl: string;
    nodes: { html: string; target: unknown[] }[];
  }

  export interface AxeResults {
    violations: AxeViolation[];
    passes: unknown[];
    incomplete: unknown[];
  }

  export function axe(
    html: Element | string,
    options?: Record<string, unknown>,
  ): Promise<AxeResults>;
}
