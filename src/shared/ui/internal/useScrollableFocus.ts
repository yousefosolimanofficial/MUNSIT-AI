"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Keyboard access to an overflowing modal body (WCAG 2.1.1; axe `scrollable-region-focusable`).
 * While the element scrolls, the caller gives it `tabIndex={0}` (plus a region name), so keyboard
 * users can reach and scroll it even when it holds no focusable content. It adds no tab stop
 * when the content fits. Re-measured on size changes of the element and its children.
 */
export function useScrollableFocus<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!active || !element || typeof ResizeObserver === "undefined") return;
    const measure = () => setScrollable(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [active]);

  return { ref, scrollable: active && scrollable };
}
