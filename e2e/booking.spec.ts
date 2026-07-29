import { expect, test, type Page } from "@playwright/test";

function futureDates() {
  const base = new Date();
  base.setUTCFullYear(base.getUTCFullYear() + 1);
  const checkOut = new Date(base);
  checkOut.setUTCDate(checkOut.getUTCDate() + 4);
  return {
    checkIn: base.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

async function openBookingPanel(page: Page) {
  await page.goto("/");
  await page.locator("#reservation").scrollIntoViewIfNeeded();
  await page
    .locator("#reservation")
    .getByRole("button", { name: "Check availability" })
    .click();
  return page.getByRole("dialog");
}

test.describe("Concept booking flow", () => {
  test("opens, traps focus, and closes with the keyboard", async ({ page }) => {
    const dialog = await openBookingPanel(page);
    await expect(dialog).toBeVisible();

    // Focus is moved into the panel rather than left behind on the trigger.
    await expect(
      dialog.getByRole("button", { name: /close the reservation panel/i }),
    ).toBeFocused();

    // Tabbing repeatedly must never escape the dialog.
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await dialog.evaluate((node) =>
        node.contains(document.activeElement),
      );
      expect(inside, `focus left the dialog after ${i + 1} tabs`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("returns focus to the button that opened it", async ({ page }) => {
    const dialog = await openBookingPanel(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await expect(
      page.locator("#reservation").getByRole("button", {
        name: "Check availability",
      }),
    ).toBeFocused();
  });

  test("locks the page behind the panel and releases it after", async ({
    page,
  }) => {
    const dialog = await openBookingPanel(page);
    await expect(page.locator("body")).toHaveAttribute(
      "data-scroll-locked",
      "true",
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-scroll-locked",
      "true",
    );
  });

  test("refuses an incomplete enquiry", async ({ page }) => {
    const dialog = await openBookingPanel(page);
    await dialog.getByRole("button", { name: /request the dates/i }).click();

    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(dialog.getByText(/no reservation has been submitted/i)).toBeHidden();
  });

  test("submits nothing to the network and says so", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (["POST", "PUT", "PATCH"].includes(request.method())) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });

    const dialog = await openBookingPanel(page);
    const { checkIn, checkOut } = futureDates();

    await dialog.getByLabel("Check-in").fill(checkIn);
    await dialog.getByLabel("Check-out").fill(checkOut);
    await dialog.getByLabel("Guests").fill("2");
    await dialog.getByLabel("Room preference").selectOption("forest-room");
    await dialog.getByLabel("Email").fill("guest@example.com");

    const urlBefore = page.url();
    await dialog.getByRole("button", { name: /request the dates/i }).click();

    await expect(
      dialog.getByText(
        /this is a fictional booking flow created for portfolio demonstration/i,
      ),
    ).toBeVisible();

    // No request left the page, and the form did not navigate.
    expect(requests).toEqual([]);
    expect(page.url()).toBe(urlBefore);
  });

  test("labels the sample rate as concept pricing", async ({ page }) => {
    const dialog = await openBookingPanel(page);

    await expect(dialog.getByText(/from thb 8,900 per night/i)).toBeVisible();
    await expect(dialog.getByText(/concept pricing/i)).toBeVisible();
    await expect(
      dialog.getByText(/no data is submitted, stored or sent anywhere/i),
    ).toBeVisible();
  });

  test("opens from the navigation bar as well", async ({ page }) => {
    // The bar's own CTA only exists at the desktop breakpoint.
    test.skip((page.viewportSize()?.width ?? 1024) < 1024, "Replaced by the menu here.");
    await page.goto("/");

    await page
      .getByRole("banner")
      .getByRole("button", { name: "Check availability" })
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
