import { FaqAccordion, type FaqItem } from "./FaqAccordion";

/*
 * FAQ section content (Phase 07 Increment 5; Figma Desktop `124:94`, Tablet `200:629`, Mobile
 * `200:778`). Server Component around the client accordion (P07-D18). Rendered inside the page's
 * `<section id="faq">`.
 *
 * | Breakpoint    | Padding (block / inline) | Gap | Intro                         | Accordion |
 * | ------------- | ------------------------ | --- | ----------------------------- | --------- |
 * | Desktop (xl)  | 80 / — (content 1200)    | 48  | 900, heading 40, lead 20      | 900       |
 * | Tablet (rail) | 64 / 32                  | 32  | 704, heading 32, large 18     | 704       |
 * | Mobile        | 48 / 20                  | 28  | 350, heading 26, base 15      | 350       |
 *
 * The intro description is Text/Secondary (Figma).
 */

export interface LandingFaqCopy {
  heading: string;
  description: string;
  items: readonly FaqItem[];
}

export function LandingFaq({ copy }: { copy: LandingFaqCopy }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[28px] px-[20px] py-[48px] rail:gap-[32px] rail:px-[32px] rail:py-[64px] xl:gap-[48px] xl:px-0 xl:py-[80px]">
      <div className="flex w-full max-w-[350px] flex-col gap-[16px] text-center rail:max-w-[704px] xl:max-w-[900px]">
        <h2
          id="landing-faq-heading"
          className="text-landing-heading-section-mobile text-text-primary rail:text-landing-heading-section-tablet xl:text-landing-heading-section-desktop"
        >
          {copy.heading}
        </h2>
        <p className="text-landing-body-base-mobile text-text-secondary rail:text-landing-body-large xl:text-landing-body-lead">
          {copy.description}
        </p>
      </div>
      <div className="w-full max-w-[350px] rail:max-w-[704px] xl:max-w-[900px]">
        <FaqAccordion items={copy.items} />
      </div>
    </div>
  );
}
