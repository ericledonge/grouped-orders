import { expect, test } from "@playwright/test";

test("user can sign up", async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;

  await page.goto("/auth/sign-up");

  await page.getByRole("textbox", { name: "Name" }).fill("Test Example");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create an account" }).click();

  console.log("🔍 Clicked signup button, waiting for redirect...");
  await page.waitForTimeout(2000);

  const errorVisible = await page
    .locator("text=/error|invalid|failed/i")
    .isVisible()
    .catch(() => false);
  if (errorVisible) {
    const errorText = await page
      .locator("text=/error|invalid|failed/i")
      .textContent();
    console.log("❌ Error visible on page:", errorText);
  }

  console.log("📍 Current URL:", page.url());

  await page.waitForURL("**/");

  await expect(page.getByText("Bienvenue")).toBeVisible();
});

test("user can sign in @smoke", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Login" }).click();

  console.log("🔍 Clicked login button, waiting for redirect...");
  await page.waitForTimeout(2000);

  const errorVisible = await page
    .locator("text=/error|invalid|credentials/i")
    .isVisible()
    .catch(() => false);
  if (errorVisible) {
    const errorText = await page
      .locator("text=/error|invalid|credentials/i")
      .textContent();
    console.log("❌ Error visible on page:", errorText);
  }

  console.log("📍 Current URL:", page.url());
  console.log("📄 Page title:", await page.title());

  await page.waitForURL("**/");

  await expect(page.getByText("Bienvenue")).toBeVisible();
});
