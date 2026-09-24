import { describe, expect, test } from "vitest";
import { authFormSchema } from "../lib/utils";

describe("authFormSchema", () => {
    describe("sign-in", () => {
        test("accepts valid sign-in data", () => {
            const result = authFormSchema("sign-in").safeParse({
                email: "test@example.com",
                password: "password123",
            });

            expect(result.success).toBe(true);
        });

        test("rejects an invalid email", () => {
            const result = authFormSchema("sign-in").safeParse({
                email: "not-an-email",
                password: "password123",
            });

            expect(result.success).toBe(false);
        });

        test("rejects a password shorter than 8 characters", () => {
            const result = authFormSchema("sign-in").safeParse({
                email: "test@example.com",
                password: "1234567",
            });

            expect(result.success).toBe(false);
        });
    });



    describe("sign-up", () => {
        const validSignUpData = {
            firstName: "John",
            lastName: "Doe",
            address: "123 Main Street",
            city: "New York",
            state: "NY",
            pinCode: "123456",
            dateOfBirth: "2000-01-01",
            email: "john@example.com",
            password: "password123",
        };

        test("accepts valid sign-up data", () => {
            const result = authFormSchema("sign-up").safeParse(validSignUpData);

            expect(result.success).toBe(true);
        });

        test("rejects a pin code containing letters", () => {
            const result = authFormSchema("sign-up").safeParse({
                ...validSignUpData,
                pinCode: "12AB56",
            });

            expect(result.success).toBe(false);
        });

        test("rejects a password shorter than 8 characters", () => {
            const result = authFormSchema("sign-up").safeParse({
                ...validSignUpData,
                password: "1234567",
            });

            expect(result.success).toBe(false);
        });
    });
});