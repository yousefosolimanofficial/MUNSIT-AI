/*
 * Test-only stand-in for `server-only` (aliased in vitest.config.ts). In the app, Next.js resolves
 * `server-only` itself and fails the build when a Client Component imports a server-only module.
 */
export {};
