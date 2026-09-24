import { afterEach, describe, expect, test } from "vitest";
import bcrypt from "bcryptjs";

import { POST } from "../../app/api/(auth)/sign-in/route";
import pool from "../../lib/db";

const testEmail = "integration-login@example.com";
let testUserId: number;

describe("POST /api/auth/login", () => {
    afterEach(async () => {
        await pool.query(
            `DELETE FROM sessions WHERE user_id = $1`,
            [testUserId]
        );

        await pool.query(
            `DELETE FROM users WHERE email = $1`,
            [testEmail]
        );
    });

    test("logs in successfully with valid credentials", async () => {
        const passwordHash = await bcrypt.hash("password123", 10);

        const userResult = await pool.query(
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
            RETURNING id
            `,
            [
                "Integration",
                "Login",
                testEmail,
                passwordHash,
                "123 Test Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        testUserId = userResult.rows[0].id;

        const request = new Request(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: "password123",
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(201);

        await expect(response.json()).resolves.toMatchObject({
            message: "Welcome Back",
            user: {
                id: testUserId,
                email: testEmail,
            },
        });

        const sessionResult = await pool.query(
            `
            SELECT session_token, user_id
            FROM sessions
            WHERE user_id = $1
            `,
            [testUserId]
        );

        expect(sessionResult.rows).toHaveLength(1);
        expect(sessionResult.rows[0].user_id).toBe(testUserId);

        const setCookie = response.headers.get("set-cookie");

        expect(setCookie).toContain("session_token=");
        expect(setCookie).toContain("HttpOnly");
    });

    test("returns 401 when the password is incorrect", async () => {
        const passwordHash = await bcrypt.hash("correct-password", 10);

        const userResult = await pool.query(
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
        RETURNING id
        `,
            [
                "Integration",
                "Login",
                testEmail,
                passwordHash,
                "123 Test Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        testUserId = userResult.rows[0].id;

        const request = new Request(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: "wrong-password",
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(401);

        await expect(response.json()).resolves.toEqual({
            message: "Incorrect id or password",
        });

        const sessionResult = await pool.query(
            `
        SELECT id
        FROM sessions
        WHERE user_id = $1
        `,
            [testUserId]
        );

        expect(sessionResult.rows).toHaveLength(0);
    });
});