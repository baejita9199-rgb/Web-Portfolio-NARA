import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Automated accessibility checks.
 *
 * axe catches roughly a third of real accessibility problems, so this is a
 * floor rather than a certificate — the keyboard, focus and screen-reader
 * behaviours that matter most are asserted directly in the other specs. What it
 * adds is a guarantee that no regression in the mechanical rules (contrast,
 * names, roles, landmarks, heading order) reaches the branch.
 */
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * axe cannot evaluate text laid over a photograph or a video: it walks up the
 * DOM looking for an opaque background colour, finds none, and assumes white.
 * The hero is therefore scanned for everything *except* colour, and its real
 * contrast is measured from rendered pixels in `hero contrast` below.
 */
const IMAGE_BACKED = "#arrival";

function describe(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes
          .slice(0, 4)
          .map(
            (node) =>
              `    ${node.target.join(" ")}\n      ${(node.failureSummary ?? "")
                .split("\n")
                .slice(1, 3)
                .join(" | ")}`,
          )
          .join("\n"),
    )
    .join("\n\n");
}

/** Every rule except colour, over the whole page including image-backed areas. */
async function auditStructure(page: Page) {
  return new AxeBuilder({ page })
    .withTags(WCAG)
    .disableRules(["color-contrast"])
    .analyze();
}

/** Colour only, over the areas where a background colour actually exists. */
async function auditContrast(page: Page) {
  return new AxeBuilder({ page })
    .withTags(WCAG)
    .exclude(IMAGE_BACKED)
    .analyze();
}

const ROUTES = [
  { name: "home", path: "/" },
  { name: "journal index", path: "/journal" },
  { name: "journal article", path: "/journal/the-courtyard-at-four-oclock" },
  { name: "room", path: "/rooms/hill-residence" },
  { name: "not found", path: "/no-such-page" },
];

for (const route of ROUTES) {
  test(`${route.name} — structure, roles and names`, async ({ page }) => {
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");

    const { violations } = await auditStructure(page);
    expect(violations, describe(violations)).toEqual([]);
  });

  test(`${route.name} — colour contrast`, async ({ page }) => {
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");

    const { violations } = await auditContrast(page);
    expect(violations, describe(violations)).toEqual([]);
  });
}

test("the whole home page passes once every section has revealed", async ({
  page,
}) => {
  await page.goto("/");

  // Scroll through so every reveal has finished — an element caught mid-fade
  // has a different computed colour than the one seen at the top of the page.
  for (const id of [
    "the-house",
    "materials",
    "rooms",
    "experience",
    "table",
    "surroundings",
    "journal",
    "reservation",
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(600);

  const structure = await auditStructure(page);
  expect(structure.violations, describe(structure.violations)).toEqual([]);

  const contrast = await auditContrast(page);
  expect(contrast.violations, describe(contrast.violations)).toEqual([]);
});

test("the booking panel passes while it is open", async ({ page }) => {
  await page.goto("/");
  await page.locator("#reservation").scrollIntoViewIfNeeded();
  await page
    .locator("#reservation")
    .getByRole("button", { name: "Check availability" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const structure = await auditStructure(page);
  expect(structure.violations, describe(structure.violations)).toEqual([]);

  const contrast = await auditContrast(page);
  expect(contrast.violations, describe(contrast.violations)).toEqual([]);
});

test("the booking panel passes while showing validation errors", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#reservation").scrollIntoViewIfNeeded();
  await page
    .locator("#reservation")
    .getByRole("button", { name: "Check availability" })
    .click();
  await page.getByRole("button", { name: /request the dates/i }).click();
  // Scoped to the dialog: Next renders its own route announcer with role="alert".
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();

  const structure = await auditStructure(page);
  expect(structure.violations, describe(structure.violations)).toEqual([]);

  const contrast = await auditContrast(page);
  expect(contrast.violations, describe(contrast.violations)).toEqual([]);
});

test("the mobile menu passes while it is open", async ({ page, viewport }) => {
  test.skip(
    (viewport?.width ?? 1024) >= 1024,
    "The menu only exists below 64rem.",
  );

  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.locator("#site-menu")).toBeVisible();

  const structure = await auditStructure(page);
  expect(structure.violations, describe(structure.violations)).toEqual([]);

  const contrast = await auditContrast(page);
  expect(contrast.violations, describe(contrast.violations)).toEqual([]);
});

/* --------------------------------------------------------------------------
   Hero contrast, measured from pixels
   -------------------------------------------------------------------------- */

const sRGB = (channel: number) => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const relativeLuminance = (r: number, g: number, b: number) =>
  0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b);

const contrastRatio = (a: number, b: number) => {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The luminance of the brightest realistic part of the background behind an
 * element — the 95th percentile rather than the single brightest pixel, so one
 * stray highlight does not decide the result.
 */
async function backgroundLuminance(
  page: Page,
  target: Locator,
): Promise<number> {
  const box = await target.boundingBox();
  if (!box) throw new Error("element has no box");

  const shot = await page.screenshot({
    clip: {
      x: Math.max(box.x, 0),
      y: Math.max(box.y, 0),
      width: Math.max(box.width, 1),
      height: Math.max(box.height, 1),
    },
  });

  const { data, info } = await sharp(shot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const luminances: number[] = [];
  for (let i = 0; i < data.length; i += info.channels) {
    luminances.push(relativeLuminance(data[i]!, data[i + 1]!, data[i + 2]!));
  }
  luminances.sort((a, b) => a - b);

  return luminances[Math.floor(luminances.length * 0.95)] ?? 1;
}

/**
 * Mean colour of the same region, used to composite semi-transparent text over
 * what is genuinely behind it.
 */
async function backgroundMeanColour(
  page: Page,
  target: Locator,
): Promise<number[]> {
  const box = await target.boundingBox();
  if (!box) throw new Error("element has no box");

  const shot = await page.screenshot({
    clip: {
      x: Math.max(box.x, 0),
      y: Math.max(box.y, 0),
      width: Math.max(box.width, 1),
      height: Math.max(box.height, 1),
    },
  });

  const { channels } = await sharp(shot).removeAlpha().stats();
  return channels.slice(0, 3).map((channel) => channel.mean);
}

test("hero copy has real contrast against the footage behind it", async ({
  page,
}) => {
  await page.goto("/");
  // Reduced motion holds the entrance still, so the text is at full opacity
  // and the clip is not mid-crossfade while the pixels are sampled.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForLoadState("networkidle");

  const content = page.locator("#arrival h1").locator("..");

  // Sample the background with the copy hidden, then compare each string's own
  // colour against what is actually behind it.
  const targets = [
    { selector: "#arrival h1", minimum: 3 }, // display size — large-text threshold
    { selector: "#arrival p:has-text('A quiet place to return.')", minimum: 3 },
    {
      selector: "#arrival p:has-text('A private retreat shaped by')",
      minimum: 4.5,
    },
    { selector: "#arrival p:has-text('Northern Thailand')", minimum: 4.5 },
  ];

  const measurements: {
    selector: string;
    ratio: number;
    minimum: number;
  }[] = [];

  for (const { selector, minimum } of targets) {
    const element = page.locator(selector).first();
    await expect(element).toBeVisible();

    const colour = await element.evaluate((node) => {
      const parsed = (getComputedStyle(node).color.match(/[\d.]+/g) ?? []).map(
        Number,
      );
      return {
        rgb: parsed.slice(0, 3),
        // Semi-transparent text is the norm on this page; ignoring the alpha
        // would flatter every measurement below.
        alpha: parsed.length > 3 ? parsed[3]! : 1,
      };
    });

    await content.evaluate((node) => {
      (node as HTMLElement).style.visibility = "hidden";
    });
    const background = await backgroundLuminance(page, element);
    const backgroundRgb = await backgroundMeanColour(page, element);
    await content.evaluate((node) => {
      (node as HTMLElement).style.visibility = "";
    });

    // Composite the text over what is actually behind it before measuring.
    const composited = colour.rgb.map(
      (channel, index) =>
        channel * colour.alpha + backgroundRgb[index]! * (1 - colour.alpha),
    );
    const foreground = relativeLuminance(
      composited[0]!,
      composited[1]!,
      composited[2]!,
    );
    measurements.push({
      selector,
      ratio: contrastRatio(foreground, background),
      minimum,
    });
  }

  const failures = measurements.filter((m) => m.ratio < m.minimum);
  expect(
    failures,
    measurements
      .map(
        (m) =>
          `${m.selector} → ${m.ratio.toFixed(2)}:1 (needs ${m.minimum}:1)`,
      )
      .join("\n"),
  ).toEqual([]);
});

test("the room gallery passes as a scrollable region", async ({ page }) => {
  await page.goto("/");
  await page.locator("#rooms").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG)
    .include("#rooms")
    .analyze();

  expect(violations, describe(violations)).toEqual([]);
});
