import { afterEach, describe, expect, test, vi } from "vitest";
import bcrypt from "bcryptjs";

import { POST } from "../../app/api/accounts/connect/route";
import pool from "../../lib/db";
import { getCurrentUser } from "../../lib/user.action";
import { NextRequest } from "next/server";

vi.mock("../../lib/user.action", () => ({
    getCurrentUser: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const testEmail = "integration-connect@example.com";
let testUserId: number;
let testAccountId: number;

describe("POST /api/accounts/connect", () => {
    afterEach(async () => {
        if (testAccountId) {
            await pool.query(
                `DELETE FROM accounts WHERE id = $1`,
                [testAccountId]
            );
        }

        if (testUserId) {
            await pool.query(
                `UPDATE users
                 SET primary_account_id = NULL
                 WHERE id = $1`,
                [testUserId]
            );

            await pool.query(
                `DELETE FROM users WHERE id = $1`,
                [testUserId]
            );
        }

        testUserId = 0;
        testAccountId = 0;

        vi.clearAllMocks();
    });

    test("connects the first bank account successfully", async () => {
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
                "Connect",
                testEmail,
                "test-password-hash",
                "123 Test Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        testUserId = userResult.rows[0].id;

        mockedGetCurrentUser.mockResolvedValue({
            id: testUserId,
        } as any);

        const bankResult = await pool.query(
            `
            SELECT id, name
            FROM banks
            ORDER BY id
            LIMIT 1
            `
        );

        const bank = bankResult.rows[0];

        const request = new NextRequest(
            "http://localhost:3000/api/accounts/connect",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bankId: bank.id,
                    paymentPin: "1234",
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(201);

        const body = await response.json();

        expect(body.message).toBe(
            "Bank account connected successfully"
        );

        expect(body.account.bank_id).toBe(bank.id);
        expect(body.account.bank_name).toBe(bank.name);
        expect(body.account.user_id).toBe(testUserId);
        expect(body.account.is_primary).toBe(true);

        expect(body.account.account_number).toMatch(/^12\d{10}$/);

        testAccountId = body.account.id;

        const accountResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                bank_id,
                account_number,
                payment_pin_hash
            FROM accounts
            WHERE id = $1
            `,
            [testAccountId]
        );

        expect(accountResult.rows).toHaveLength(1);

        const account = accountResult.rows[0];

        expect(account.user_id).toBe(testUserId);
        expect(account.bank_id).toBe(bank.id);
        expect(account.account_number).toBe(
            body.account.account_number
        );

        expect(account.payment_pin_hash).not.toBe("1234");

        await expect(
            bcrypt.compare("1234", account.payment_pin_hash)
        ).resolves.toBe(true);

        const userCheck = await pool.query(
            `
            SELECT primary_account_id
            FROM users
            WHERE id = $1
            `,
            [testUserId]
        );

        expect(userCheck.rows[0].primary_account_id).toBe(
            testAccountId
        );
    });

    test("returns 409 when the user already has an account with the bank", async () => {
      
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
                "Duplicate",
                testEmail,
                "test-password-hash",
                "123 Test Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        testUserId = userResult.rows[0].id;

        mockedGetCurrentUser.mockResolvedValue({
            id: testUserId,
        } as any);

        const bankResult = await pool.query(
            `
        SELECT id, name
        FROM banks
        ORDER BY id
        LIMIT 1
        `
        );

        const bank = bankResult.rows[0];

        const accountResult = await pool.query(
            `
        INSERT INTO accounts (
            user_id,
            bank_id,
            account_number,
            payment_pin_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
            [
                testUserId,
                bank.id,
                "129999999999",
                await bcrypt.hash("1234", 10),
            ]
        );

        testAccountId = accountResult.rows[0].id;

        const request = new NextRequest(
            "http://localhost:3000/api/accounts/connect",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bankId: bank.id,
                    paymentPin: "1234",
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(409);

        const body = await response.json();

        expect(body.message).toBe(
            "You already have an account with this bank"
        );

        const accountsResult = await pool.query(
            `
        SELECT id
        FROM accounts
        WHERE user_id = $1
        AND bank_id = $2
        `,
            [testUserId, bank.id]
        );

        expect(accountsResult.rows).toHaveLength(1);
    });
});