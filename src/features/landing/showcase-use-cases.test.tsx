// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { LandingShowcase, type LandingShowcaseCopy } from "./components/LandingShowcase";
import { LandingUseCases, type LandingUseCasesCopy } from "./components/LandingUseCases";
import {
  FEATURE_IMAGES,
  SHOWCASE_SCREEN,
  STEP_IMAGES,
  USE_CASE_IMAGES,
} from "./model/landing-images";

/* Phase 07 Increment 3: Showcase and Use Cases units, with the real message catalogs. */

type Locale = "ar" | "en";

afterEach(cleanup);

function showcaseCopy(locale: Locale): LandingShowcaseCopy {
  const s = MESSAGES[locale].landing.showcase;
  return {
    heading: s.heading,
    description: s.description,
    recording: s.recording,
    timer: s.timer,
    lectureTitle: s.lectureTitle,
    sidebarTitle: s.sidebarTitle,
    sidebar: Object.values(s.sidebar),
    mobile: {
      live: s.mobile.live,
      heading: s.mobile.heading,
      lines: [
        { time: s.mobile.time1, text: s.mobile.line1 },
        { time: s.mobile.time2, text: s.mobile.line2 },
      ],
      pause: s.mobile.pause,
    },
  };
}

function useCasesCopy(locale: Locale): LandingUseCasesCopy {
  const u = MESSAGES[locale].landing.useCases;
  return { heading: u.heading, description: u.description, items: Object.values(u.items) };
}

const FOCUSABLE = "a, button, input, select, textarea, [tabindex], [role=button]";

describe.each(["ar", "en"] as const)("LandingShowcase (%s)", (locale) => {
  const copy = showcaseCopy(locale);

  it("renders the heading verbatim as the section h2 (U+2028 kept, drawn as a break)", () => {
    render(<LandingShowcase copy={copy} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.id).toBe("landing-showcase-heading");
    expect(heading.textContent).toBe(copy.heading);
    expect(heading.querySelectorAll("br")).toHaveLength(copy.heading.split(" ").length - 1);
    expect(screen.getByText(copy.description).tagName).toBe("P");
  });

  it("the app window is a hidden, non-interactive illustration", () => {
    const { container } = render(<LandingShowcase copy={copy} />);
    const win = container.querySelector("[data-showcase-window]");
    expect(win?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelectorAll(FOCUSABLE)).toHaveLength(0);
    expect(win?.querySelector("img")?.getAttribute("alt")).toBe("");
    expect(win?.querySelector("img")?.getAttribute("src")).toContain(
      encodeURIComponent(SHOWCASE_SCREEN.src),
    );
  });

  it("illustration copy: timer LTR, two-tone title, menu and transcript in Figma order", () => {
    const { container } = render(<LandingShowcase copy={copy} />);
    const timer = within(container).getByText(copy.timer);
    expect(timer.getAttribute("dir")).toBe("ltr");
    const title = container.querySelector("[data-showcase-title]");
    const [first, second] = copy.lectureTitle.split("\n");
    expect([...(title?.children ?? [])].map((line) => line.textContent)).toEqual([first, second]);
    expect(title?.children[0]?.className).toContain("text-text-primary");
    expect(title?.children[1]?.className).toContain("text-text-secondary");
    const menu = container.querySelectorAll("[data-showcase-sidebar] li");
    expect([...menu].map((item) => item.textContent)).toEqual(copy.sidebar);
    const mobile = container.querySelector("[data-showcase-mobile]");
    for (const line of copy.mobile.lines) {
      expect(mobile?.textContent).toContain(line.text);
      expect(
        within(mobile as HTMLElement)
          .getByText(line.time)
          .getAttribute("dir"),
      ).toBe("ltr");
    }
    expect(mobile?.textContent).toContain(copy.mobile.pause);
    expect(mobile?.textContent).toContain(copy.mobile.live);
  });

  it("waveform: ten static bars with the Figma heights", () => {
    const { container } = render(<LandingShowcase copy={copy} />);
    const bars = container.querySelectorAll<HTMLElement>("[data-showcase-waveform] > span");
    expect([...bars].map((bar) => bar.style.height)).toEqual(
      [8, 16, 24, 14, 20, 10, 18, 12, 22, 9].map((h) => `${h}px`),
    );
    expect(container.innerHTML).not.toMatch(/animate-/);
  });
});

describe.each(["ar", "en"] as const)("LandingUseCases (%s)", (locale) => {
  const copy = useCasesCopy(locale);

  it("h2 then one h3 per row, with eyebrow and text, in order", () => {
    render(<LandingUseCases copy={copy} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(copy.heading);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(
      copy.items.map((item) => item.title),
    );
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    rows.forEach((row, index) => {
      const item = copy.items[index];
      expect(row.textContent).toContain(item?.eyebrow);
      expect(row.textContent).toContain(item?.text);
    });
  });

  it("decorative images from the Figma assets; rows 1 and 3 put the image at the inline end", () => {
    const { container } = render(<LandingUseCases copy={copy} />);
    expect(container.querySelectorAll(FOCUSABLE)).toHaveLength(0);
    const boxes = container.querySelectorAll("[data-use-case-image]");
    expect(boxes).toHaveLength(3);
    boxes.forEach((box, index) => {
      const image = box.querySelector("img");
      expect(image?.getAttribute("alt")).toBe("");
      expect(image?.getAttribute("src")).toContain(
        encodeURIComponent(USE_CASE_IMAGES[index]?.src ?? "missing"),
      );
      expect(box.className.includes("xl:order-last")).toBe(index !== 1);
    });
  });
});

/** Reads a WebP's pixel size (lossy `VP8 `, lossless `VP8L` or extended `VP8X`). */
function webpSize(file: Buffer) {
  expect(file.toString("ascii", 0, 4)).toBe("RIFF");
  expect(file.toString("ascii", 8, 12)).toBe("WEBP");
  const chunk = file.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { width: file.readUInt16LE(26) & 0x3fff, height: file.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = file.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  expect(chunk).toBe("VP8X");
  return { width: file.readUIntLE(24, 3) + 1, height: file.readUIntLE(27, 3) + 1 };
}

describe("landing images", () => {
  it.each([SHOWCASE_SCREEN, ...USE_CASE_IMAGES, ...FEATURE_IMAGES, ...STEP_IMAGES])(
    "$src exists as WebP at its source size",
    (image) => {
      const file = readFileSync(join(process.cwd(), "public", image.src));
      expect(webpSize(file)).toEqual({ width: image.width, height: image.height });
      expect(file.byteLength).toBeLessThan(100_000);
    },
  );

  it("six feature visuals and four step visuals, in card order", () => {
    expect(FEATURE_IMAGES).toHaveLength(6);
    expect(STEP_IMAGES).toHaveLength(4);
  });

  it("every asset is used once (no duplicates)", () => {
    const sources = [SHOWCASE_SCREEN, ...USE_CASE_IMAGES, ...FEATURE_IMAGES, ...STEP_IMAGES].map(
      (image) => image.src,
    );
    expect(new Set(sources).size).toBe(sources.length);
  });
});
