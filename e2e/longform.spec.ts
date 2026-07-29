import { expect, test } from "@playwright/test";

const ARTICLE = "/journal/on-building-with-quiet-materials";
const ROOM = "/rooms/courtyard-suite";

test.describe("Journal article", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ARTICLE);
  });

  test("opens with a title, standfirst and lead plate", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "On Building with Quiet Materials",
    );
    await expect(
      page.getByText(/before a single wall went up/i),
    ).toBeVisible();

    const lead = page.locator("figure").first().locator("img");
    await expect(lead).toBeVisible();
    expect(
      await lead.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    ).toBe(true);
  });

  test("carries real long-form structure, not a stub", async ({ page }) => {
    const article = page.locator("article");

    // Subheads, a pull quote, captioned plates and a list — the things that
    // separate an article from a paragraph of filler.
    await expect(article.getByRole("heading", { level: 2 })).not.toHaveCount(0);
    await expect(article.locator("blockquote")).not.toHaveCount(0);
    await expect(article.locator("figure figcaption")).not.toHaveCount(0);

    const words = await article.evaluate(
      (node) => (node.textContent ?? "").trim().split(/\s+/).length,
    );
    expect(words).toBeGreaterThan(500);
  });

  test("keeps the reading measure narrow while figures break wider", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) < 1024, "Measured at the desktop layout.");

    const paragraph = await page
      .locator("article p")
      .nth(2)
      .evaluate((node) => node.getBoundingClientRect().width);
    const figure = await page
      .locator("article figure")
      .last()
      .evaluate((node) => node.getBoundingClientRect().width);

    expect(paragraph).toBeLessThan(figure);
  });

  test("offers further reading and a way back", async ({ page }) => {
    const related = page.getByRole("navigation", {
      name: /more from the journal/i,
    });
    await related.scrollIntoViewIfNeeded();

    const links = related.getByRole("link");
    await expect(links).toHaveCount(2);

    // Never suggests the article you are already on.
    const hrefs = await links.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href")),
    );
    expect(hrefs).not.toContain(ARTICLE);

    // Scoped to the article: the site footer carries the same link.
    await expect(
      page.locator("article").getByRole("link", {
        name: /all journal entries/i,
      }),
    ).toBeVisible();
  });

  test("publishes Article structured data, and no lodging markup", async ({
    page,
  }) => {
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(blocks.length).toBeGreaterThan(0);

    const parsed = blocks.map((block) => JSON.parse(block));
    expect(parsed.some((entry) => entry["@type"] === "Article")).toBe(true);

    // A fictional brand must never be described to a search engine as a real
    // business that takes bookings.
    const serialised = JSON.stringify(parsed);
    expect(serialised).not.toMatch(/Hotel|LodgingBusiness|Resort/);
  });

  test("states the disclaimer on the article itself", async ({ page }) => {
    await expect(
      page.locator("article").getByText(/fictional hospitality brand/i),
    ).toBeVisible();
  });
});

test.describe("Journal index", () => {
  test("leads with the most recent entry", async ({ page }) => {
    await page.goto("/journal");

    const lead = page.locator("article").first();
    await expect(lead).toContainText("Latest");
    await expect(lead).toContainText("Walking the Ridge Before Light");
  });

  test("lists the subjects it covers", async ({ page }) => {
    await page.goto("/journal");
    for (const subject of ["Materials", "Seasons", "Table", "Craft"]) {
      await expect(page.getByText(subject, { exact: true }).first()).toBeVisible();
    }
  });
});

test.describe("Room page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROOM);
  });

  test("leads with the room, its position in the set and the facts", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Courtyard Suite",
    );
    await expect(page.getByText("02 / 03")).toBeVisible();
    await expect(page.getByText("58 SQ M")).toBeVisible();
    await expect(page.getByText(/from thb 12,400/i).first()).toBeVisible();
  });

  test("carries prose, a plate sequence and plainly stated facts", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /longer stays/i }),
    ).toBeVisible();

    // Three plates plus the hero and the other-room thumbnails.
    const plates = page.locator("figure");
    await expect(plates).toHaveCount(3);

    await expect(
      page.getByRole("heading", { name: /plainly stated/i }),
    ).toBeVisible();
    for (const label of ["Outlook", "Bathroom", "Climate", "Sound", "Steps"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("describes light, season and materials", async ({ page }) => {
    for (const heading of ["Light", "Through the year", "Made from"]) {
      await expect(page.getByText(heading, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Natural stone", { exact: true })).toBeVisible();
  });

  test("lists what every room has, without repeating it per room", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /in every room/i }),
    ).toBeVisible();
    await expect(page.getByText(/no television/i)).toBeVisible();
  });

  test("opens the concept booking panel and labels the rate", async ({
    page,
  }) => {
    await expect(page.getByText(/concept pricing shown/i)).toBeVisible();

    await page
      .getByRole("button", { name: "Check availability" })
      .last()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("links to the other two rooms and not to itself", async ({ page }) => {
    const others = page.getByRole("navigation", { name: /other rooms/i });
    await others.scrollIntoViewIfNeeded();

    const hrefs = await others
      .getByRole("link")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    expect(hrefs).toEqual(["/rooms/forest-room", "/rooms/hill-residence"]);
  });
});

test.describe("Reservation detail", () => {
  test("states how to get here and what a day looks like", async ({ page }) => {
    await page.goto("/");
    await page.locator("#reservation").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: /coming here/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /the shape of a day/i }),
    ).toBeVisible();

    await expect(page.getByText(/ninety minutes by road/i)).toBeVisible();
    await expect(page.getByText(/07:30/)).toBeVisible();
    await expect(page.getByText(/none of it is compulsory/i)).toBeVisible();
  });
});
