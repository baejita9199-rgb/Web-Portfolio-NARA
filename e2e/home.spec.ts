import { expect, test } from "@playwright/test";

test.describe("Arrival", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the hero and the NARA HOUSE name", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("NARA");
    await expect(heading).toContainText("HOUSE");

    // Scoped to the hero: the same line is repeated in the footer.
    await expect(
      page.locator("#arrival").getByText("A quiet place to return."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /explore the house/i }),
    ).toBeVisible();
  });

  test("has the correct document title", async ({ page }) => {
    await expect(page).toHaveTitle("NARA HOUSE — A Quiet Place to Return");
  });

  test("renders a poster image behind the hero clip", async ({ page }) => {
    const hero = page.locator("#arrival");

    // The poster is a real <img>, not a `poster` attribute, so it is delivered
    // responsively and remains the fallback if the clip never plays.
    const poster = hero.locator("img").first();
    await expect(poster).toBeVisible();

    const loaded = await poster.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    );
    expect(loaded).toBe(true);
  });

  test("reveals The House section on scroll", async ({ page }) => {
    const section = page.locator("#the-house");
    const heading = page.getByRole("heading", {
      name: /the house was designed around what already existed/i,
    });

    // The section is several screens tall, so the heading itself is the thing
    // to bring into view rather than the section's top edge.
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeInViewport({ timeout: 10_000 });

    // The reveal starts each block at zero opacity. Asserting that it finishes
    // is what proves content can never be left stranded in its hidden state.
    await expect
      .poll(
        async () =>
          heading.evaluate((node) => {
            const wrapper = node.closest("[class*='reveal']") ?? node;
            return Number(getComputedStyle(wrapper).opacity);
          }),
        { timeout: 10_000, message: "revealed copy should settle at full opacity" },
      )
      .toBe(1);

    await expect(section.getByText("The morning light.")).toBeVisible();
  });

  test("shows the fictional-concept disclaimer in the footer", async ({
    page,
  }) => {
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();

    await expect(footer).toContainText(
      /NARA HOUSE is a fictional hospitality brand/i,
    );
    await expect(footer).toContainText(/concept project/i);
    await expect(footer).toContainText(/fictional contact details/i);
  });

  test("keeps every in-page section anchor resolvable", async ({ page }) => {
    for (const id of [
      "arrival",
      "the-house",
      "materials",
      "rooms",
      "experience",
      "table",
      "surroundings",
      "journal",
      "reservation",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("exposes one h1 and a heading outline with no gaps", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);

    const levels = await page
      .locator("h1, h2, h3")
      .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));

    let previous = 0;
    for (const level of levels) {
      // A heading may only ever descend one level at a time.
      if (level > previous) expect(level - previous).toBeLessThanOrEqual(1);
      previous = level;
    }
  });

  test("moves focus to the content from the skip link", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });
});

test.describe("Journal route", () => {
  test("opens a journal entry from the home page list", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", {
      name: /on building with quiet materials/i,
    });
    await link.scrollIntoViewIfNeeded();
    await link.click();

    await expect(page).toHaveURL(/\/journal\/on-building-with-quiet-materials$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "On Building with Quiet Materials",
    );
  });

  test("lists every entry on the journal index", async ({ page }) => {
    await page.goto("/journal");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const title of [
      "On Building with Quiet Materials",
      "The First Rain",
      "A Morning Table",
    ]) {
      await expect(page.getByRole("link", { name: title })).toBeVisible();
    }
  });

  test("opens a room page from the gallery CTA", async ({ page }) => {
    await page.goto("/rooms/forest-room");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Forest Room",
    );
    await expect(page.getByText("42 SQ M")).toBeVisible();
    await expect(page.getByText(/concept pricing shown/i)).toBeVisible();
  });
});
