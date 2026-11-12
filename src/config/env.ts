/**
 * Public environment configuration.
 *
 * Only NEXT_PUBLIC_* variables may be read here: they are inlined into the
 * browser bundle, so they must never hold secrets. Server-only secrets, when
 * they exist, belong in a separate server-only module.
 */

export const APP_ENVS = ["development", "test", "production"] as const;
export type AppEnv = (typeof APP_ENVS)[number];

export interface PublicEnv {
  appEnv: AppEnv;
}

type RawPublicEnv = {
  NEXT_PUBLIC_APP_ENV?: string | undefined;
};

function isAppEnv(value: string): value is AppEnv {
  return (APP_ENVS as readonly string[]).includes(value);
}

export function parsePublicEnv(raw: RawPublicEnv): PublicEnv {
  const appEnv = raw.NEXT_PUBLIC_APP_ENV?.trim() || "development";
  if (!isAppEnv(appEnv)) {
    throw new Error(
      `Invalid NEXT_PUBLIC_APP_ENV "${appEnv}". Expected one of: ${APP_ENVS.join(", ")}.`,
    );
  }
  return { appEnv };
}

// Each variable is referenced explicitly so Next.js can inline it at build time.
export const publicEnv: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});
