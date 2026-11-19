import Image from "next/image";

import { USE_CASE_IMAGES } from "../model/landing-images";

/*
 * Use Cases (Phase 07 Increment 3). Figma Desktop `123:64`, Tablet `200:616`, Mobile `200:765`
 * (design-values §16.6).
 *
 * - Section: padding 72 / 80 (Desktop), 64 (Tablet), 48 (Mobile); inline 0 / 32 / 20; content
 *   1200; gap 48 / 32 / 24 between the intro and the rows.
 * - Intro: `Landing/Heading/Section` 40 / 32 / 26 and `Landing/Body/Lead` 20, `Large` 18,
 *   `Base Mobile` 15; white, centred; 900 / 704 / 350 wide.
 * - Rows (Ink, 1px Slate, radius 20): Desktop horizontal, padding 32, gap 40, vertically centred:
 *   image 500 × 276 (radius 16), content in the rest. Rows 1 and 3 put the image at the inline end,
 *   row 2 at the inline start (Figma's left/right in the RTL frame). Tablet and Mobile stack the
 *   image (654 × 280 / 316 × 200, full width) above the content; padding 24 / 16, gap 24 / 20.
 * - Content: eyebrow `Landing/Label/Strong` Electric Sky, title `Landing/Heading/Subsection`
 *   (an `h3`), text `Landing/Body/Large` Text/Secondary; gap 20; text at the inline start.
 * - Images are illustrative photos next to their own title and text: decorative (`alt=""`).
 *   Fixed boxes with cover, so they cause no layout shift.
 */

export interface LandingUseCaseItem {
  eyebrow: string;
  title: string;
  text: string;
}

export interface LandingUseCasesCopy {
  heading: string;
  description: string;
  items: readonly LandingUseCaseItem[];
}

export function LandingUseCases({ copy }: { copy: LandingUseCasesCopy }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[24px] px-[20px] py-[48px] rail:gap-[32px] rail:px-[32px] rail:py-[64px] xl:gap-[48px] xl:px-0 xl:pt-[72px] xl:pb-[80px]">
      <div
        className="flex w-full max-w-[350px] flex-col gap-[16px] text-center text-text-primary rail:max-w-[704px] xl:max-w-[900px]"
        data-use-cases-intro=""
      >
        <h2
          id="landing-use-cases-heading"
          className="text-landing-heading-section-mobile rail:text-landing-heading-section-tablet xl:text-landing-heading-section-desktop"
        >
          {copy.heading}
        </h2>
        <p className="text-landing-body-base-mobile rail:text-landing-body-large xl:text-landing-body-lead">
          {copy.description}
        </p>
      </div>

      <ul className="flex w-full flex-col gap-[24px] rail:gap-[32px] xl:gap-[48px]">
        {copy.items.map((item, index) => {
          const image = USE_CASE_IMAGES[index];
          const imageAtEnd = index % 2 === 0;
          return (
            <li
              key={item.title}
              data-use-case={index + 1}
              className="flex flex-col gap-[20px] rounded-[20px] border border-neutral-slate bg-surface-ink p-[16px] rail:gap-[24px] rail:p-[24px] xl:flex-row xl:items-center xl:gap-[40px] xl:px-[32px] xl:py-[31px]"
            >
              {image ? (
                <div
                  data-use-case-image=""
                  className={`relative h-[200px] w-full shrink-0 overflow-hidden rounded-[16px] rail:h-[280px] xl:h-[276px] xl:w-[500px] ${imageAtEnd ? "xl:order-last" : ""}`}
                >
                  <Image
                    src={image.src}
                    width={image.width}
                    height={image.height}
                    alt=""
                    sizes="(min-width: 1280px) 500px, (min-width: 720px) calc(100vw - 114px), calc(100vw - 74px)"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col gap-[20px] text-start">
                <p className="text-landing-label-strong text-accent-electric-sky">{item.eyebrow}</p>
                <h3 className="text-landing-heading-subsection text-text-primary">{item.title}</h3>
                <p className="text-landing-body-large text-text-secondary">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
