/**
 * Module boundary rules — Development Roadmap v1.0 §3:
 *   app → features → shared / api / state / i18n / types / config / design-system
 *   shared never imports features or app; a feature never imports another
 *   feature; design-system imports nothing; api imports only types.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are not allowed.",
      from: {},
      to: { circular: true },
    },
    {
      name: "app-is-entry-only",
      severity: "error",
      comment: "Nothing outside src/app may import from src/app (routing only).",
      from: { path: "^src/", pathNot: "^src/app/" },
      to: { path: "^src/app/" },
    },
    {
      name: "shared-not-to-features",
      severity: "error",
      comment: "src/shared must not depend on features.",
      from: { path: "^src/shared/" },
      to: { path: "^src/features/" },
    },
    {
      name: "no-cross-feature-imports",
      severity: "error",
      comment: "A feature must not import another feature; move shared code to src/shared.",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/", pathNot: "^src/features/$1/" },
    },
    {
      name: "lower-layers-not-to-features",
      severity: "error",
      comment: "api, state, i18n, types, config and design-system must not depend on features.",
      from: { path: "^src/(api|state|i18n|types|config|design-system)/" },
      to: { path: "^src/features/" },
    },
    {
      name: "design-system-is-a-leaf",
      severity: "error",
      comment: "src/design-system imports nothing from the rest of src.",
      from: { path: "^src/design-system/" },
      to: { path: "^src/", pathNot: "^src/design-system/" },
    },
    {
      name: "api-only-to-types",
      severity: "error",
      comment: "src/api may import only src/types (and itself).",
      from: { path: "^src/api/" },
      to: { path: "^src/", pathNot: "^src/(api|types)/" },
    },
    {
      name: "types-is-a-leaf",
      severity: "error",
      comment: "src/types holds shared domain types only.",
      from: { path: "^src/types/" },
      to: { path: "^src/", pathNot: "^src/types/" },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment: "Imports must resolve.",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-dev-deps-in-app-code",
      severity: "error",
      comment: "Production code must not import devDependencies.",
      from: { path: "^src/", pathNot: "\\.(test|spec)\\.(ts|tsx)$" },
      to: { dependencyTypes: ["npm-dev"], dependencyTypesNot: ["type-only"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      mainFields: ["module", "main", "types", "typings"],
    },
  },
};
