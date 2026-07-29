import { expect, test } from "@playwright/test";

test.describe("Ambient video system", () => {
  test("plays the hero clip and pauses it once it leaves the viewport", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.locator("#arrival video");
    await expect(hero).toHaveCount(1);

    // Muted, inline, looping, and with no controls exposed.
    await expect(hero).toHaveJSProperty("muted", true);
    await expect(hero).toHaveJSProperty("loop", true);
    await expect(hero).not.toHaveAttribute("controls");

    await expect
      .poll(
        async () => hero.evaluate((video: HTMLVideoElement) => video.paused),
        { timeout: 15_000, message: "hero clip should start playing" },
      )
      .toBe(false);

    await page.locator("#materials").scrollIntoViewIfNeeded();

    await expect
      .poll(
        async () => hero.evaluate((video: HTMLVideoElement) => video.paused),
        { timeout: 10_000, message: "off-screen clip should be paused" },
      )
      .toBe(true);
  });

  test("never runs more than one clip at a time", async ({ page }) => {
    await page.goto("/");

    const countPlaying = () =>
      page.evaluate(
        () =>
          Array.from(document.querySelectorAll("video")).filter(
            (video) => !video.paused,
          ).length,
      );

    for (const section of ["#arrival", "#experience", "#table", "#reservation"]) {
      await page.locator(section).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      expect(await countPlaying(), `while viewing ${section}`).toBeLessThanOrEqual(1);
    }
  });

  test("does not download clips that are still far down the page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const attached = await page.evaluate(() =>
      Array.from(document.querySelectorAll("video")).map(
        (video) => video.querySelectorAll("source").length,
      ),
    );

    // The hero has its source; everything below the fold is still empty.
    expect(attached[0]).toBeGreaterThan(0);
    expect(attached.slice(1).every((count) => count === 0)).toBe(true);
  });

  test("attaches a clip's source only as it approaches", async ({ page }) => {
    await page.goto("/");
    await page.locator("#table").scrollIntoViewIfNeeded();

    const seasonal = page.locator("#table video");
    await expect
      .poll(async () =>
        seasonal.evaluate((video: HTMLVideoElement) => video.querySelectorAll("source").length),
      )
      .toBeGreaterThan(0);
  });

  test("pauses everything when the tab is hidden", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("#arrival video");

    await expect
      .poll(async () => hero.evaluate((v: HTMLVideoElement) => v.paused), {
        timeout: 15_000,
      })
      .toBe(false);

    // Chromium honours a dispatched visibilitychange when the property is
    // overridden, which is the same signal a real tab switch produces.
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await expect
      .poll(async () => hero.evaluate((v: HTMLVideoElement) => v.paused), {
        timeout: 8_000,
      })
      .toBe(true);
  });
});

test.describe("Reduced motion", () => {
  // `emulateMedia` rather than `test.use({ reducedMotion })`: the fixture form
  // is not applied by this Playwright version, and a silently un-emulated run
  // would make these assertions pass against the wrong preference.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const applied = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(applied, "reduced-motion emulation must be active").toBe(true);
  });

  test("renders no video elements at all", async ({ page }) => {
    await expect(page.locator("video")).toHaveCount(0);

    await page.locator("#table").scrollIntoViewIfNeeded();
    await expect(page.locator("video")).toHaveCount(0);
  });

  test("shows the poster in place of every clip", async ({ page }) => {
    const poster = page.locator("#arrival img").first();

    await expect(poster).toBeVisible();
    const loaded = await poster.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    );
    expect(loaded).toBe(true);
  });

  test("keeps all content present and readable", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const [selector, text] of [
      ["#the-house", "The morning light."],
      ["#materials", "Built with the land, not placed upon it."],
      ["#table", "A seasonal table."],
      ["#reservation", "Stay for a while."],
    ] as const) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(page.locator(selector).getByText(text).first()).toBeVisible();
    }
  });

  test("applies no parallax transform to media layers", async ({ page }) => {
    await page.locator("#the-house").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const transforms = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("[class*='inner']"))
        .map((el) => getComputedStyle(el).transform)
        .filter((value) => value && value !== "none"),
    );
    expect(transforms).toEqual([]);
  });

  test("leaves the room gallery fully usable", async ({ page }) => {
    await page.locator("#rooms").scrollIntoViewIfNeeded();

    await page.getByRole("button", { name: "Next room" }).click();
    await expect(page.getByRole("status")).toContainText("02 / 03");
  });
});
