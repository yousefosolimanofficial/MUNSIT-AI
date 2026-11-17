"use client";

import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";
import { Popover } from "@/shared/ui/Popover";

/*
 * MUNSIT AI — notifications trigger (Phase 05, D-S5). Figma: `Notifications Trigger`
 * `2211:194` (Desktop) / `2238:764` (Mobile, 44).
 *
 * - O-8 `NavigationIconButton` (`bell`): `md` 40 in the Desktop/Tablet Top Bar, `lg` 44 on
 *   Mobile (O-8 contract D-NIB1).
 * - **No unread dot, no count, no items** (no notification data exists, D-17 / D-S5): the Figma
 *   Coral "Unread Dot" is sample data and is not rendered.
 * - Opens the Phase 03 Popover titled "الإشعارات" (Figma `Notification Dropdown` title, 16
 *   SemiBold) with the approved "coming soon" message.
 */

export interface NotificationsTriggerProps {
  size: "md" | "lg";
  labels: { notifications: string; notificationsSoon: string };
}

export function NotificationsTrigger({ size, labels }: NotificationsTriggerProps) {
  return (
    <Popover
      label={labels.notifications}
      trigger={(props) => (
        <NavigationIconButton
          ref={props.ref}
          icon="bell"
          size={size}
          label={labels.notifications}
          aria-haspopup={props["aria-haspopup"]}
          aria-expanded={props["aria-expanded"]}
          aria-controls={props["aria-controls"]}
          onClick={props.onClick}
        />
      )}
    >
      <p className="text-dashboard-card-title text-text-primary">{labels.notifications}</p>
      <p className="text-dashboard-body text-text-secondary">{labels.notificationsSoon}</p>
    </Popover>
  );
}
