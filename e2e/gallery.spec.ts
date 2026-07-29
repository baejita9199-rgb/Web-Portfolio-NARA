import { expect, test, type Page } from "@playwright/test";

test.describe("Room gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#rooms").scrollIntoViewIfNeeded();
  });

  const track = (page: Page) =>
    page.getByRole("region", { name: "Rooms at NARA HOUSE" });

  test("is reachable and operable by keyboard", async ({ page }) => {
    const region = track(page);
    await expect(region).toBeVisible();

    // A scrollable region must be focusable, or a keyboard user cannot reach
    // the content that is scrolled out of it.
    await region.focus();
    await expect(region).toBeFocused();

    const start = await region.evaluate((el) => el.scrollLeft);
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => region.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(start);

    await page.keyboard.press("ArrowLeft");
    await expect
      .poll(async () => region.evaluate((el) => el.scrollLeft))
      .toBeLessThanOrEqual(start + 4);
  });

  test("jumps to the ends with Home and End", async ({ page }) => {
    const region = track(page);
    await region.focus();

    await page.keyboard.press("End");
    await expect
      .poll(async () => region.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);

    await page.keyboard.press("Home");
    await expect
      .poll(async () => region.evaluate((el) => el.scrollLeft))
      .toBeLessThan(8);
  });

  test("advances with the next control and reports progress", async ({
    page,
  }) => {
    const status = page.getByRole("status");
    await expect(status).toContainText("01 / 03");

    await page.getByRole("button", { name: "Next room" }).click();
    await expect(status).toContainText("02 / 03");
    await expect(status).toContainText("Courtyard Suite");

    await page.getByRole("button", { name: "Previous room" }).click();
    await expect(status).toContainText("01 / 03");
  });

  test("disables the controls at each end of the track", async ({ page }) => {
    const previous = page.getByRole("button", { name: "Previous room" });
    const next = page.getByRole("button", { name: "Next room" });

    await expect(previous).toBeDisabled();

    await next.click();
    await next.click();
    await expect(next).toBeDisabled();
    await expect(previous).toBeEnabled();
  });

  test("never scrolls the page itself sideways", async ({ page }) => {
    const region = track(page);
    await region.focus();
    await page.keyboard.press("End");
    await page.waitForTimeout(600);

    // The gallery's own track is a scroll container by design; what must not
    // happen is the *page* gaining horizontal travel because of it.
    const pageScrolledX = await page.evaluate(() => {
      window.scrollTo(900, window.scrollY);
      const x = window.scrollX;
      window.scrollTo(0, window.scrollY);
      return x;
    });
    expect(pageScrolledX).toBe(0);

    const bodyOverflow = await page.evaluate(
      () => document.body.scrollWidth - document.documentElement.clientWidth,
    );
    expect(bodyOverflow).toBeLessThanOrEqual(1);
  });

  test("links each room to its own page", async ({ page }) => {
    const links = page.getByRole("link", { name: /view room/i });
    await expect(links).toHaveCount(3);

    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href")),
    );
    expect(hrefs).toEqual([
      "/rooms/forest-room",
      "/rooms/courtyard-suite",
      "/rooms/hill-residence",
    ]);
  });
});
