"use client";

import { useEffect } from "react";

/*
 * Scroll reveal for the Landing (Visual Refinement, P07-D17 / plan §8e). Renders nothing.
 *
 * On mount, every `[data-reveal]` element that is still below the viewport is set to
 * `data-reveal="pending"` (styled by REVEAL / REVEAL_FADE: transparent, 12 px low) and becomes
 * `"shown"` the first time it enters the viewport. Elements already on screen are never hidden,
 * so there is no flash on load. Nothing happens under `prefers-reduced-motion: reduce`, without
 * IntersectionObserver, or without JavaScript: content is visible by default. Opacity and
 * translate only: no layout shift, no scroll-jacking, no interaction blocked (pending elements
 * still receive focus; focusing one reveals it).
 */
export function LandingReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const show = (element: HTMLElement) => {
      element.dataset.reveal = "shown";
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) show(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const element of elements) {
      if (element.getBoundingClientRect().top < window.innerHeight) continue; // already visible
      element.dataset.reveal = "pending";
      observer.observe(element);
    }

    const onFocus = (event: FocusEvent) => {
      const pending = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-reveal='pending']",
      );
      if (pending) show(pending);
    };
    document.addEventListener("focusin", onFocus);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocus);
      // Never leave content hidden if the component unmounts.
      for (const element of elements) {
        if (element.dataset.reveal === "pending") element.dataset.reveal = "shown";
      }
    };
  }, []);

  return null;
}
