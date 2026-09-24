import { test, expect } from "@playwright/test";

test("user can sign in and reach the dashboard", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByPlaceholder("Enter your email").fill(
    "bruce@gmail.com"
  );

  await page.getByPlaceholder("Enter your password").fill(
    "12341234"
  );

  await page.getByRole("button", {
    name: "Sign In",
  }).click();

  await expect(page).toHaveURL("/");
});