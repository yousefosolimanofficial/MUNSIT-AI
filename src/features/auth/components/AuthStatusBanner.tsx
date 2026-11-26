import { Icon } from "@/shared/ui/Icon";

/*
 * `Status Banner` (Figma: Register Failed `2480:2636`, Forgot Failed `2480:2869`, Reset Error
 * `2480:659`). The form-level message for a server-side result, placed directly under the card
 * header, above the fields. It is not the Login banner (`AuthErrorBanner`: between the fields and
 * the button, radius 12, no icon).
 *
 * 48 high: Coral Pulse 8% fill, Coral Pulse 35% border, radius 14 (local constant), padding 12 / 14,
 * gap 10. The official `alert` icon (18, Coral Pulse) at the inline start, then the message in
 * `Dashboard/Body Medium` Coral Pulse. An alert region rendered only while there is a message, so it
 * is announced once; it never takes focus.
 */
export function AuthStatusBanner({ message, id }: { message?: string | null; id?: string }) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      data-auth-status-banner=""
      className="flex items-center gap-2.5 rounded-[14px] border border-solid border-accent-coral-pulse/35 bg-accent-coral-pulse/8 px-3.5 py-3 text-dashboard-body-medium text-accent-coral-pulse"
    >
      <Icon name="alert" size={18} className="shrink-0" />
      <span className="min-w-0 flex-1 text-start">{message}</span>
    </div>
  );
}
