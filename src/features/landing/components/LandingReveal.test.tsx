// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LandingReveal } from "./LandingReveal";

/*
 * Visual Refinement: scroll reveal. jsdom has no layout, IntersectionObserver or matchMedia: element
 * positions, the observer and the media query are stubbed.
 */

let reduced = false;
let callback: IntersectionObserverCallback = () => {};
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  reduced = false;
  observe.mockClear();
  disconnect.mockClear();
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce") ? reduced : false,
    media: query,
  })) as unknown as typeof window.matchMedia;
  window.IntersectionObserver = class {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb;
    }
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
  } as unknown as typeof IntersectionObserver;
});

afterEach(cleanup);

function page() {
  return render(
    <>
      <div data-reveal="" data-testid="above" />
      <div data-reveal="" data-testid="below">
        <a href="#x">link</a>
      </div>
      <LandingReveal />
    </>,
  );
}

function placeBelowFold(element: HTMLElement) {
  element.getBoundingClientRect = () => ({ top: window.innerHeight + 200 }) as DOMRect;
}

describe("LandingReveal", () => {
  it("hides only elements below the fold, and shows them on intersection", () => {
    // Positions must exist before the effect runs: patch the prototype for "below".
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return { top: this.dataset.testid === "below" ? window.innerHeight + 200 : 0 } as DOMRect;
    };
    const view = page();
    HTMLElement.prototype.getBoundingClientRect = original;

    const above = view.getByTestId("above");
    const below = view.getByTestId("below");
    expect(above.dataset.reveal).toBe("");
    expect(below.dataset.reveal).toBe("pending");
    expect(observe).toHaveBeenCalledWith(below);

    callback(
      [{ isIntersecting: true, target: below } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(below.dataset.reveal).toBe("shown");
  });

  it("focusing content inside a pending element reveals it (keyboard users never meet hidden content)", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return { top: this.dataset.testid === "below" ? window.innerHeight + 200 : 0 } as DOMRect;
    };
    const view = page();
    HTMLElement.prototype.getBoundingClientRect = original;
    const below = view.getByTestId("below");
    expect(below.dataset.reveal).toBe("pending");
    view.getByRole("link").focus();
    expect(below.dataset.reveal).toBe("shown");
  });

  it("reduced motion: nothing is hidden or observed", () => {
    reduced = true;
    const view = page();
    placeBelowFold(view.getByTestId("below"));
    expect(view.getByTestId("below").dataset.reveal).toBe("");
    expect(observe).not.toHaveBeenCalled();
  });

  it("unmounting never leaves content hidden", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return { top: this.dataset.testid === "below" ? window.innerHeight + 200 : 0 } as DOMRect;
    };
    const view = render(
      <>
        <div data-reveal="" data-testid="below" />
        <LandingReveal />
      </>,
    );
    HTMLElement.prototype.getBoundingClientRect = original;
    const below = view.getByTestId("below");
    expect(below.dataset.reveal).toBe("pending");
    view.unmount();
    expect(below.dataset.reveal).toBe("shown");
    expect(disconnect).toHaveBeenCalled();
  });
});
