import { expect, test } from "@playwright/test";

test("user can sign up", async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;

  await page.goto("/auth/sign-up");

  await page.getByRole("textbox", { name: "Name" }).fill("Test Example");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create an account" }).click();

  await expect(page.getByText("Bienvenue")).toBeVisible();
});

test("user can sign in", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Email" }).fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Bienvenue")).toBeVisible();
});
