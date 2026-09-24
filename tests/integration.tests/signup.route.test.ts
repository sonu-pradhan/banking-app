import { afterEach, describe, expect, test } from "vitest";

import { POST } from "../../app/api/(auth)/sign-up/route";
import pool from "../../lib/db";

const testEmail = "integration-test@example.com";

describe("POST /api/auth/signup", () => {
    afterEach(async () => {
        await pool.query(
            `DELETE FROM users WHERE email = $1`,
            [testEmail]
        );
    });

    test("creates a new user successfully", async () => {
        const request = new Request(
            "http://localhost:3000/api/auth/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: "Integration",
                    lastName: "Test",
                    email: testEmail,
                    password: "password123",
                    address: "123 Test Street",
                    city: "Cuttack",
                    state: "Odisha",
                    pinCode: "753001",
                    dateOfBirth: "2000-01-01",
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(201);

        await expect(response.json()).resolves.toEqual({
            message: "Account created successfully",
        });

        const result = await pool.query(
            `
            SELECT
                "firstName",
                "lastName",
                email,
                password_hash,
                address,
                city,
                state,
                "pinCode",
                "dateOfBirth"
            FROM users
            WHERE email = $1
            `,
            [testEmail]
        );

        expect(result.rows).toHaveLength(1);

        expect(result.rows[0]).toMatchObject({
            firstName: "Integration",
            lastName: "Test",
            email: testEmail,
            address: "123 Test Street",
            city: "Cuttack",
            state: "Odisha",
            pinCode: "753001",
            dateOfBirth: "2000-01-01",
        });

        expect(result.rows[0].password_hash).not.toBe("password123");
        expect(result.rows[0].password_hash).toBeTruthy();
    });

    test("returns 409 when the email already exists", async () => {
        await pool.query(
            `
        INSERT INTO users (
            "firstName",
            "lastName",
            email,
            password_hash,
            address,
            city,
            state,
            "pinCode",
            "dateOfBirth"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
            [
                "Existing",
                "User",
                testEmail,
                "already-hashed-password",
                "123 Test Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        const request = new Request(
            "http://localhost:3000/api/auth/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: "Another",
                    lastName: "User",
                    email: testEmail,
                    password: "password123",
                    address: "456 Another Street",
                    city: "Cuttack",
                    state: "Odisha",
                    pinCode: "753002",
                    dateOfBirth: "2001-01-01",
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(409);

        await expect(response.json()).resolves.toEqual({
            message: "User already exists",
        });
    });
});