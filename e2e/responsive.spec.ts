import { expect, test, type Page } from "@playwright/test";

/**
 * The navigation swaps between an inline bar and a full-screen menu at 64rem.
 * Branching on the viewport rather than Playwright's `isMobile` fixture keeps
 * the tests tied to the breakpoint the CSS actually uses.
 */
const NAV_BREAKPOINT = 1024;
function isNarrow(page: Page): boolean {
  return (page.viewportSize()?.width ?? NAV_BREAKPOINT) < NAV_BREAKPOINT;
}

/**
 * Horizontal overflow, measured the way a visitor would experience it.
 *
 * `documentElement.scrollWidth` is not usable here: Chromium folds the content
 * width of nested scroll containers into it, so the room gallery's own
 * (correctly clipped) track would register as page overflow. What actually
 * matters is that the body's content fits and that the page cannot be dragged
 * sideways, so both are asserted.
 */
/**
 * Returns to the top and waits for the page to actually settle there.
 *
 * `scroll-behavior: smooth` means a click on an in-page anchor keeps animating
 * after the assertion that followed it; a single instant `scrollTo` can be
 * overtaken by that animation. Forcing the position each frame until it stops
 * moving is the only reliable way to be at the top.
 */
async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let previous = -1;
        const settle = () => {
          window.scrollTo({ top: 0, behavior: "instant" });
          if (window.scrollY === 0 && previous === 0) {
            resolve();
            return;
          }
          previous = window.scrollY;
          requestAnimationFrame(settle);
        };
        settle();
      }),
  );
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const overflow =
      document.body.scrollWidth - document.documentElement.clientWidth;

    const before = window.scrollX;
    window.scrollTo(800, window.scrollY);
    const scrolled = window.scrollX;
    window.scrollTo(before, window.scrollY);

    return Math.max(overflow, scrolled);
  });
}

test.describe("Layout integrity", () => {
  test("never overflows horizontally, at any point down the page", async ({
    page,
  }) => {
    await page.goto("/");
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    const sections = [
      "#the-house",
      "#materials",
      "#rooms",
      "#experience",
      "#table",
      "#surroundings",
      "#journal",
      "#reservation",
    ];

    for (const selector of sections) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      expect(
        await horizontalOverflow(page),
        `horizontal overflow at ${selector}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test("holds up at 320px, the narrowest viewport worth supporting", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/");

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.locator("#reservation").scrollIntoViewIfNeeded();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test("survives an orientation change without breaking the layout", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#rooms").scrollIntoViewIfNeeded();

    // Polled rather than measured once: a resize triggers a ScrollTrigger
    // refresh, and sampling mid-refresh is not a meaningful reading.
    for (const size of [
      { width: 900, height: 500 },
      { width: 500, height: 900 },
    ]) {
      await page.setViewportSize(size);
      await expect
        .poll(() => horizontalOverflow(page), {
          timeout: 8_000,
          message: `horizontal overflow at ${size.width}px`,
        })
        .toBeLessThanOrEqual(1);
    }
  });

  test("gives every image an intrinsic size so nothing shifts", async ({
    page,
  }) => {
    await page.goto("/");
    const untyped = await page.locator("img").evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          const img = node as HTMLImageElement;
          // `fill` images are sized by their frame rather than by attributes.
          const isFill = img.style.position === "absolute";
          return !isFill && (!img.getAttribute("width") || !img.getAttribute("height"));
        })
        .map((node) => (node as HTMLImageElement).currentSrc || node.getAttribute("src")),
    );
    expect(untyped).toEqual([]);
  });
});

test.describe("Navigation", () => {
  test("scrolls to the right section from the primary nav", async ({ page }) => {
    test.skip(isNarrow(page), "The inline nav is replaced by the menu here.");
    await page.goto("/");

    for (const [label, id] of [
      ["The House", "the-house"],
      ["Rooms", "rooms"],
      ["Experience", "experience"],
      ["Journal", "journal"],
    ] as const) {
      // The bar retracts while scrolling down, so it is brought back the same
      // way a visitor would: by returning to the top of the page.
      await scrollToTop(page);
      await expect(page.getByRole("banner")).toHaveAttribute(
        "data-hidden",
        "false",
      );

      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: label, exact: true })
        .click();

      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport({ timeout: 8_000 });
    }
  });

  test("turns opaque once the hero has passed", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header).toHaveAttribute("data-transparent", "true");

    await page.locator("#materials").scrollIntoViewIfNeeded();
    await expect(header).toHaveAttribute("data-transparent", "false");
  });

  test("hides on the way down and returns on the way up", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");

    await page.locator("#experience").scrollIntoViewIfNeeded();
    await expect(header).toHaveAttribute("data-hidden", "true");

    await page.mouse.wheel(0, -400);
    await expect(header).toHaveAttribute("data-hidden", "false");
  });

  test("opens and closes the full-screen menu on narrow viewports", async ({
    page,
  }) => {
    test.skip(!isNarrow(page), "The menu toggle only exists below 64rem.");
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /open menu/i });
    await toggle.click();

    const menu = page.locator("#site-menu");
    await expect(menu).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute(
      "data-scroll-locked",
      "true",
    );

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-scroll-locked",
      "true",
    );
  });

  test("navigates from the mobile menu and closes behind itself", async ({
    page,
  }) => {
    test.skip(!isNarrow(page), "The menu toggle only exists below 64rem.");
    await page.goto("/");

    await page.getByRole("button", { name: /open menu/i }).click();
    await page.locator("#site-menu").getByRole("link", { name: /rooms/i }).click();

    await expect(page.locator("#site-menu")).toBeHidden();
    await expect(page.locator("#rooms")).toBeInViewport({ timeout: 8_000 });
  });
});
