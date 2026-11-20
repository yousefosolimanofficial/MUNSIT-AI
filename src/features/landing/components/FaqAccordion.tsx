"use client";

import { useId, useState } from "react";

import { FOCUS_RING, INTERACTIVE_TRANSITION } from "./landing-styles";

/*
 * FAQ accordion (Phase 07 Increment 5; Figma "FAQ / Accordion Item" `124:99` / `124:105`, states
 * Collapsed, Hover, Expanded; decision P07-D18).
 *
 * Behaviour (P07-D18): item 01 is expanded on load; at most one item is expanded; opening another
 * closes the previous one; activating the expanded item closes it, so all may be collapsed.
 *
 * Semantics: each question is an `h3` holding a native `<button aria-expanded aria-controls>`
 * (Enter / Space, Tab order, no trap); the answer is a `region` labelled by its button. A
 * collapsed answer is `visibility: hidden`, so it leaves the accessibility tree and the tab order.
 * The height animates with CSS grid rows (no fixed heights), instantly under reduced motion.
 *
 * Figma: item padding 20 / 24 (Mobile 20 / 16), radius 12, gap 12 header → answer; Ink fill and
 * Slate border (Collapsed, Expanded), Obsidian and Iron on hover; question `Heading/Medium`
 * (24 / 1.4, white) at the inline start, 20 px icon at the inline end (gap 16): a plus in
 * Text/Secondary when collapsed, a minus in Electric Sky when expanded; answer `Body/Regular`
 * (20 / 1.6, Text/Secondary).
 */

export interface FaqItem {
  question: string;
  answer: string;
}

const ITEM = [
  "rounded-[12px] border bg-surface-ink",
  INTERACTIVE_TRANSITION,
  "border-neutral-slate has-[button:hover]:border-neutral-iron has-[button:hover]:bg-surface-obsidian",
].join(" ");

const TRIGGER = [
  "flex w-full cursor-pointer items-start gap-[16px] rounded-[12px] px-[16px] py-[20px] text-start rail:px-[24px]",
  FOCUS_RING,
].join(" ");

function FaqIcon({ expanded }: { expanded: boolean }) {
  return (
    <span aria-hidden="true" className="relative mt-[7px] size-[20px] shrink-0" data-faq-icon="">
      <span
        className={`absolute inset-0 m-auto h-[2px] w-[12px] rounded-[0.75px] ${expanded ? "bg-accent-electric-sky" : "bg-text-secondary"}`}
      />
      {expanded ? null : (
        <span className="absolute inset-0 m-auto h-[12px] w-[2px] rounded-[0.75px] bg-text-secondary" />
      )}
    </span>
  );
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const baseId = useId();
  // P07-D18: item 01 open on load; one at a time; null = all collapsed.
  const [open, setOpen] = useState<number | null>(items.length > 0 ? 0 : null);

  return (
    <div className="flex w-full flex-col gap-[13px]" data-faq-accordion="">
      {items.map((item, index) => {
        const expanded = open === index;
        const buttonId = `${baseId}-q${index + 1}`;
        const panelId = `${baseId}-a${index + 1}`;
        return (
          <div key={index} className={ITEM} data-faq-item={index + 1} data-expanded={expanded}>
            <h3 className="text-heading-medium text-text-primary">
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className={TRIGGER}
              >
                <span className="min-w-0 flex-1">{item.question}</span>
                <FaqIcon expanded={expanded} />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={[
                "grid transition-[grid-template-rows,visibility] duration-slow ease-standard motion-reduce:transition-none",
                expanded ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
              ].join(" ")}
              data-faq-panel=""
            >
              <div className="min-h-0 overflow-hidden">
                {/* −8: Figma's 12 header → answer gap under the trigger's 20 bottom padding. */}
                <p className="-mt-[8px] px-[16px] pb-[20px] text-start text-[20px] leading-[1.6] text-text-secondary rail:px-[24px]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
