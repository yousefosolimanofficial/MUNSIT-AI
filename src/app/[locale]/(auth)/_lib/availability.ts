import { notFound } from "next/navigation";

import { isAuthenticationAvailable } from "@/config/availability";
import { publicEnv } from "@/config/env";

/**
 * P07-D25 (owner, 2026-11-22): the Auth routes are Phase 04 placeholders ("not implemented"). In
 * production they return 404 until Authentication is operational (`AUTHENTICATION_AVAILABLE`, the
 * same gate that hides the Landing entry points, P07-D24); development and preview keep the
 * placeholders. Call it from both `generateMetadata` and the page, so no placeholder title or
 * markup is produced in production.
 */
export function assertAuthRouteAvailable(): void {
  if (!isAuthenticationAvailable(publicEnv.appEnv)) notFound();
}
