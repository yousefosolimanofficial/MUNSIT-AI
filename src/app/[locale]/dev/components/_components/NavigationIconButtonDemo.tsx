"use client";

import { useState } from "react";

import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";

/*
 * Interactive Navigation Icon Button samples for the temporary /dev/components gallery (O-8):
 * an action that toggles `aria-expanded`, an action that counts activations (keyboard and pointer
 * evidence), and the same disabled action (it must never count). Labels come from the server page
 * (approved `shell` copy), so this component holds no copy.
 */

export interface NavigationIconButtonDemoLabels {
  openMenu: string;
  notifications: string;
  search: string;
}

export function NavigationIconButtonDemo({ labels }: { labels: NavigationIconButtonDemoLabels }) {
  const [expanded, setExpanded] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-wrap items-center gap-md">
      <NavigationIconButton
        data-testid="nib-expand"
        icon="menu"
        label={labels.openMenu}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      />
      <NavigationIconButton
        data-testid="nib-count"
        icon="bell"
        label={labels.notifications}
        onClick={() => setCount((n) => n + 1)}
      />
      <NavigationIconButton
        data-testid="nib-count-disabled"
        icon="bell"
        label={labels.notifications}
        disabled
        onClick={() => setCount((n) => n + 1)}
      />
      <NavigationIconButton
        data-testid="nib-lg"
        icon="search"
        label={labels.search}
        size="lg"
        onClick={() => setCount((n) => n + 1)}
      />
      <output
        data-testid="nib-count-value"
        className="font-mono text-dashboard-meta text-text-secondary"
        lang="en"
      >
        {count}
      </output>
    </div>
  );
}
