import { test, expect } from "@playwright/test";

test.describe("Custom React Directives", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main app page
    await page.goto("/");
  });

  test("should show ai-loading skeleton before stream starts", async ({ page }) => {
    // Intercept the API call and delay the response to ensure loading state is visible
    await page.route("**/api/research", async (route) => {
      // Delay fulfillment
      await new Promise(r => setTimeout(r, 1000));
      await route.fulfill({
        contentType: "text/event-stream",
        body: `data: {"type":"step","data":{"step":"web_search"}}\n\n`,
      });
    });

    // Fill the form and submit
    await page.fill("textarea", "What is pgvector?");
    await page.click("button[type='submit']");

    // The ai-loading directive should be visible (there might be multiple on the page)
    const loadingSkeleton = page.locator("[data-testid='ai-loading']").first();
    await expect(loadingSkeleton).toBeVisible();
  });

  test("should stream text token-by-token via ai-stream", async ({ page }) => {
    // Intercept and send a fake stream
    await page.route("**/api/research", async (route) => {
      const stream = `
data: {"type":"step","data":{"step":"synthesis"}}

data: {"type":"token","data":{"text":"Hello "}}

data: {"type":"token","data":{"text":"World"}}

data: {"type":"complete","data":{"report":"Hello World"}}
`;
      await route.fulfill({
        contentType: "text/event-stream",
        body: stream.trim() + "\n\n",
      });
    });

    await page.fill("textarea", "Tell me a joke");
    await page.click("button[type='submit']");

    // Check for ai-stream content to update with streamed tokens
    const streamContent = page.locator("[data-testid='ai-stream-content']");
    await expect(streamContent).toHaveText("Hello World");
  });

  test("should show ai-retry on failure and allow resubmit", async ({ page }) => {
    // First request fails
    await page.route("**/api/research", async (route) => {
      await route.fulfill({
        status: 500,
        body: "Internal Server Error",
      });
    }, { times: 1 });

    await page.fill("textarea", "Trigger error");
    await page.click("button[type='submit']");

    // ai-retry components should become visible
    const retryContainer = page.locator("[data-testid='ai-retry']");
    const retryButton = page.locator("[data-testid='ai-retry-button']");
    
    await expect(retryContainer).toBeVisible();
    await expect(retryButton).toBeVisible();

    // Second request succeeds
    await page.route("**/api/research", async (route) => {
      const stream = `
data: {"type":"step","data":{"step":"synthesis"}}

data: {"type":"complete","data":{"report":"Recovered Text"}}
`;
      await route.fulfill({
        contentType: "text/event-stream",
        body: stream.trim() + "\n\n",
      });
    });

    // Click retry
    await retryButton.click();

    // The stream content should eventually show the recovered text
    const streamContent = page.locator("[data-testid='ai-stream-content']");
    await expect(streamContent).toHaveText("Recovered Text");
  });
});
