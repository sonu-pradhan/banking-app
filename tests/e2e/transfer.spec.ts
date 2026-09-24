import { test, expect } from "@playwright/test";

test("user can transfer money and see it in transaction history", async ({
    page,
}) => {

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


    await page.goto("/payment-transfer");


    await page
        .getByPlaceholder("example@email.com or account number")
        .fill("x@gmail.com");

    await page.getByPlaceholder("0.00").fill("102");

    await page
        .getByPlaceholder("Enter your account PIN")
        .fill("1234");


    await page.getByRole("button", {
        name: "Send Money",
    }).click();


    await expect(page).toHaveURL("/transaction-history");


    const transaction = page
        .locator("div.group")
        .filter({
            hasText: "x@gmail.com",
        })
        .filter({
            hasText: "- ₹102.00",
        });

    await expect(transaction).toBeVisible();
});