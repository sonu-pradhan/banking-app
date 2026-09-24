import { afterEach, describe, expect, test, vi } from "vitest";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

import { POST } from "../../app/api/accounts/transfer/route";
import pool from "../../lib/db";
import { getCurrentUser } from "../../lib/user.action";

vi.mock("../../lib/user.action", () => ({
    getCurrentUser: vi.fn(),
}));

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

const senderEmail = "integration-sender@example.com";
const receiverEmail = "integration-receiver@example.com";

let senderUserId = 0;
let receiverUserId = 0;
let senderAccountId = 0;
let receiverAccountId = 0;
let testIdempotencyKey = "";

const getIdempotencyKey = () =>
    crypto.randomUUID();

describe("POST /api/accounts/transfer", () => {
    afterEach(async () => {
        // Delete transaction created by the test
        if (testIdempotencyKey) {
            await pool.query(
                `
                DELETE FROM transactions
                WHERE idempotency_key = $1
                `,
                [testIdempotencyKey]
            );
        }

        // Delete sender account
        if (senderAccountId) {
            await pool.query(
                `DELETE FROM accounts WHERE id = $1`,
                [senderAccountId]
            );
        }

        // Delete receiver account
        if (receiverAccountId) {
            await pool.query(
                `DELETE FROM accounts WHERE id = $1`,
                [receiverAccountId]
            );
        }

        // Delete sender user
        if (senderUserId) {
            await pool.query(
                `DELETE FROM users WHERE id = $1`,
                [senderUserId]
            );
        }

        // Delete receiver user
        if (receiverUserId) {
            await pool.query(
                `DELETE FROM users WHERE id = $1`,
                [receiverUserId]
            );
        }

        senderUserId = 0;
        receiverUserId = 0;
        senderAccountId = 0;
        receiverAccountId = 0;
        testIdempotencyKey = "";

        vi.clearAllMocks();
    });

    test("transfers money successfully between two accounts", async () => {
        testIdempotencyKey = getIdempotencyKey();

        /*
         * Create sender user
         */
        const senderUserResult = await pool.query(
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
                "Sender",
                senderEmail,
                "test-password-hash",
                "123 Sender Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        senderUserId = senderUserResult.rows[0].id;

        /*
         * Create receiver user
         */
        const receiverUserResult = await pool.query(
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
                "Receiver",
                receiverEmail,
                "test-password-hash",
                "456 Receiver Street",
                "Cuttack",
                "Odisha",
                "753002",
                "2000-01-01",
            ]
        );

        receiverUserId = receiverUserResult.rows[0].id;

        /*
         * Get a bank
         */
        const bankResult = await pool.query(
            `
            SELECT id
            FROM banks
            ORDER BY id
            LIMIT 1
            `
        );

        const bankId = bankResult.rows[0].id;

        /*
         * Create payment PIN hash
         */
        const paymentPinHash = await bcrypt.hash("1234", 10);

        /*
         * Create sender account with ₹5000
         */
        const senderAccountResult = await pool.query(
            `
            INSERT INTO accounts (
                user_id,
                bank_id,
                account_number,
                balance,
                payment_pin_hash
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [
                senderUserId,
                bankId,
                "129999999991",
                5000,
                paymentPinHash,
            ]
        );

        senderAccountId = senderAccountResult.rows[0].id;

        /*
         * Create receiver account with ₹1000
         */
        const receiverAccountResult = await pool.query(
            `
            INSERT INTO accounts (
                user_id,
                bank_id,
                account_number,
                balance,
                payment_pin_hash
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [
                receiverUserId,
                bankId,
                "129999999992",
                1000,
                paymentPinHash,
            ]
        );

        receiverAccountId = receiverAccountResult.rows[0].id;

        /*
         * Make receiver account primary
         */
        await pool.query(
            `
            UPDATE users
            SET primary_account_id = $1
            WHERE id = $2
            `,
            [receiverAccountId, receiverUserId]
        );

        /*
         * Mock authenticated sender
         */
        mockedGetCurrentUser.mockResolvedValue({
            id: senderUserId,
        } as any);

        /*
         * Create request
         */
        const request = new NextRequest(
            "http://localhost:3000/api/accounts/transfer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    senderAccountId,
                    recipient: receiverEmail,
                    amount: 500,
                    pin: "1234",
                    idempotencyKey: testIdempotencyKey,
                }),
            }
        );

        /*
         * Call route
         */
        const response = await POST(request);

        expect(response.status).toBe(201);

        const body = await response.json();

        expect(body.message).toBe("Transfer successful");

        /*
         * Verify sender balance
         */
        const senderCheck = await pool.query(
            `
            SELECT balance
            FROM accounts
            WHERE id = $1
            `,
            [senderAccountId]
        );

        expect(Number(senderCheck.rows[0].balance)).toBe(4500);

        /*
         * Verify receiver balance
         */
        const receiverCheck = await pool.query(
            `
            SELECT balance
            FROM accounts
            WHERE id = $1
            `,
            [receiverAccountId]
        );

        expect(Number(receiverCheck.rows[0].balance)).toBe(1500);

        /*
         * Verify transaction
         */
        const transactionResult = await pool.query(
            `
            SELECT
                sender_account_id,
                receiver_account_id,
                amount,
                status,
                idempotency_key
            FROM transactions
            WHERE idempotency_key = $1
            `,
            [testIdempotencyKey]
        );

        expect(transactionResult.rows).toHaveLength(1);

        const transaction = transactionResult.rows[0];

        expect(transaction.sender_account_id).toBe(senderAccountId);
        expect(transaction.receiver_account_id).toBe(receiverAccountId);
        expect(Number(transaction.amount)).toBe(500);
        expect(transaction.status).toBe("success");
        expect(transaction.idempotency_key).toBe(
            testIdempotencyKey
        );
    });

    test("rejects a duplicate transfer with the same idempotency key", async () => {
        testIdempotencyKey = getIdempotencyKey();

        /*
         * Create sender user
         */
        const senderUserResult = await pool.query(
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
                "Sender",
                senderEmail,
                "test-password-hash",
                "123 Sender Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        senderUserId = senderUserResult.rows[0].id;

        /*
         * Create receiver user
         */
        const receiverUserResult = await pool.query(
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
                "Receiver",
                receiverEmail,
                "test-password-hash",
                "456 Receiver Street",
                "Cuttack",
                "Odisha",
                "753002",
                "2000-01-01",
            ]
        );

        receiverUserId = receiverUserResult.rows[0].id;

        /*
         * Get a bank
         */
        const bankResult = await pool.query(
            `
            SELECT id
            FROM banks
            ORDER BY id
            LIMIT 1
            `
        );

        const bankId = bankResult.rows[0].id;

        /*
         * Create payment PIN hash
         */
        const paymentPinHash = await bcrypt.hash("1234", 10);

        /*
         * Create sender account
         */
        const senderAccountResult = await pool.query(
            `
            INSERT INTO accounts (
                user_id,
                bank_id,
                account_number,
                balance,
                payment_pin_hash
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [
                senderUserId,
                bankId,
                "129999999991",
                5000,
                paymentPinHash,
            ]
        );

        senderAccountId = senderAccountResult.rows[0].id;

        /*
         * Create receiver account
         */
        const receiverAccountResult = await pool.query(
            `
            INSERT INTO accounts (
                user_id,
                bank_id,
                account_number,
                balance,
                payment_pin_hash
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [
                receiverUserId,
                bankId,
                "129999999992",
                1000,
                paymentPinHash,
            ]
        );

        receiverAccountId = receiverAccountResult.rows[0].id;


        await pool.query(
            `
            UPDATE users
            SET primary_account_id = $1
            WHERE id = $2
            `,
            [receiverAccountId, receiverUserId]
        );


        mockedGetCurrentUser.mockResolvedValue({
            id: senderUserId,
        } as any);


        const createRequest = () =>
            new NextRequest(
                "http://localhost:3000/api/accounts/transfer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        senderAccountId,
                        recipient: receiverEmail,
                        amount: 500,
                        pin: "1234",
                        idempotencyKey: testIdempotencyKey,
                    }),
                }
            );


        const firstResponse = await POST(createRequest());

        expect(firstResponse.status).toBe(201);


        const secondResponse = await POST(createRequest());

        expect(secondResponse.status).toBe(409);

        const secondBody = await secondResponse.json();

        expect(secondBody.message).toBe(
            "This transfer has already been processed"
        );


        const senderCheck = await pool.query(
            `
            SELECT balance
            FROM accounts
            WHERE id = $1
            `,
            [senderAccountId]
        );

        expect(Number(senderCheck.rows[0].balance)).toBe(4500);

        const receiverCheck = await pool.query(
            `
            SELECT balance
            FROM accounts
            WHERE id = $1
            `,
            [receiverAccountId]
        );

        expect(Number(receiverCheck.rows[0].balance)).toBe(1500);

        const transactionResult = await pool.query(
            `
            SELECT id
            FROM transactions
            WHERE idempotency_key = $1
            `,
            [testIdempotencyKey]
        );

        expect(transactionResult.rows).toHaveLength(1);
    });


    test("rejects transfer when sender has insufficient balance", async () => {
        testIdempotencyKey = crypto.randomUUID();

        /*
         * Create sender user
         */
        const senderUserResult = await pool.query(
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
                "Sender",
                senderEmail,
                "test-password-hash",
                "123 Sender Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        senderUserId = senderUserResult.rows[0].id;

        /*
         * Create receiver user
         */
        const receiverUserResult = await pool.query(
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
                "Receiver",
                receiverEmail,
                "test-password-hash",
                "456 Receiver Street",
                "Cuttack",
                "Odisha",
                "753002",
                "2000-01-01",
            ]
        );

        receiverUserId = receiverUserResult.rows[0].id;

        /*
         * Get a bank
         */
        const bankResult = await pool.query(
            `
        SELECT id
        FROM banks
        ORDER BY id
        LIMIT 1
        `
        );

        const bankId = bankResult.rows[0].id;

        /*
         * Create payment PIN hash
         */
        const paymentPinHash = await bcrypt.hash("1234", 10);

        /*
         * Create sender account with only ₹500
         */
        const senderAccountResult = await pool.query(
            `
        INSERT INTO accounts (
            user_id,
            bank_id,
            account_number,
            balance,
            payment_pin_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
            [
                senderUserId,
                bankId,
                "129999999991",
                500,
                paymentPinHash,
            ]
        );

        senderAccountId = senderAccountResult.rows[0].id;

        /*
         * Create receiver account with ₹1000
         */
        const receiverAccountResult = await pool.query(
            `
        INSERT INTO accounts (
            user_id,
            bank_id,
            account_number,
            balance,
            payment_pin_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
            [
                receiverUserId,
                bankId,
                "129999999992",
                1000,
                paymentPinHash,
            ]
        );

        receiverAccountId = receiverAccountResult.rows[0].id;

        /*
         * Make receiver account primary
         */
        await pool.query(
            `
        UPDATE users
        SET primary_account_id = $1
        WHERE id = $2
        `,
            [receiverAccountId, receiverUserId]
        );

        /*
         * Mock authenticated sender
         */
        mockedGetCurrentUser.mockResolvedValue({
            id: senderUserId,
        } as any);

        /*
         * Try to transfer ₹1000 when sender only has ₹500
         */
        const request = new NextRequest(
            "http://localhost:3000/api/accounts/transfer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    senderAccountId,
                    recipient: receiverEmail,
                    amount: 1000,
                    pin: "1234",
                    idempotencyKey: testIdempotencyKey,
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.message).toBe(
            "Insufficient account balance"
        );

        /*
         * Sender balance must remain unchanged
         */
        const senderCheck = await pool.query(
            `
        SELECT balance
        FROM accounts
        WHERE id = $1
        `,
            [senderAccountId]
        );

        expect(Number(senderCheck.rows[0].balance)).toBe(500);

        /*
         * Receiver balance must remain unchanged
         */
        const receiverCheck = await pool.query(
            `
        SELECT balance
        FROM accounts
        WHERE id = $1
        `,
            [receiverAccountId]
        );

        expect(Number(receiverCheck.rows[0].balance)).toBe(1000);

        /*
         * No transaction should be created
         */
        const transactionResult = await pool.query(
            `
        SELECT id
        FROM transactions
        WHERE idempotency_key = $1
        `,
            [testIdempotencyKey]
        );

        expect(transactionResult.rows).toHaveLength(0);
    });

    test("rejects transfer when payment PIN is incorrect", async () => {
        testIdempotencyKey = crypto.randomUUID();

        /*
         * Create sender user
         */
        const senderUserResult = await pool.query(
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
                "Sender",
                senderEmail,
                "test-password-hash",
                "123 Sender Street",
                "Cuttack",
                "Odisha",
                "753001",
                "2000-01-01",
            ]
        );

        senderUserId = senderUserResult.rows[0].id;

        /*
         * Create receiver user
         */
        const receiverUserResult = await pool.query(
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
                "Receiver",
                receiverEmail,
                "test-password-hash",
                "456 Receiver Street",
                "Cuttack",
                "Odisha",
                "753002",
                "2000-01-01",
            ]
        );

        receiverUserId = receiverUserResult.rows[0].id;

        /*
         * Get a bank
         */
        const bankResult = await pool.query(
            `
        SELECT id
        FROM banks
        ORDER BY id
        LIMIT 1
        `
        );

        const bankId = bankResult.rows[0].id;

        /*
         * Store the CORRECT payment PIN as 1234
         */
        const paymentPinHash = await bcrypt.hash("1234", 10);

        /*
         * Create sender account with ₹5000
         */
        const senderAccountResult = await pool.query(
            `
        INSERT INTO accounts (
            user_id,
            bank_id,
            account_number,
            balance,
            payment_pin_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
            [
                senderUserId,
                bankId,
                "129999999991",
                5000,
                paymentPinHash,
            ]
        );

        senderAccountId = senderAccountResult.rows[0].id;

        /*
         * Create receiver account with ₹1000
         */
        const receiverAccountResult = await pool.query(
            `
        INSERT INTO accounts (
            user_id,
            bank_id,
            account_number,
            balance,
            payment_pin_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
            [
                receiverUserId,
                bankId,
                "129999999992",
                1000,
                paymentPinHash,
            ]
        );

        receiverAccountId = receiverAccountResult.rows[0].id;

        /*
         * Make receiver account primary
         */
        await pool.query(
            `
        UPDATE users
        SET primary_account_id = $1
        WHERE id = $2
        `,
            [receiverAccountId, receiverUserId]
        );

        /*
         * Mock authenticated sender
         */
        mockedGetCurrentUser.mockResolvedValue({
            id: senderUserId,
        } as any);

        /*
         * Try transfer using WRONG PIN
         *
         * Correct PIN = 1234
         * Supplied PIN = 9999
         */
        const request = new NextRequest(
            "http://localhost:3000/api/accounts/transfer",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    senderAccountId,
                    recipient: receiverEmail,
                    amount: 500,
                    pin: "9999",
                    idempotencyKey: testIdempotencyKey,
                }),
            }
        );

        const response = await POST(request);

        expect(response.status).toBe(401);

        const body = await response.json();

        expect(body.message).toBe(
            "Invalid payment PIN"
        );

        /*
         * Sender balance must remain unchanged
         */
        const senderCheck = await pool.query(
            `
        SELECT balance
        FROM accounts
        WHERE id = $1
        `,
            [senderAccountId]
        );

        expect(Number(senderCheck.rows[0].balance)).toBe(5000);

        /*
         * Receiver balance must remain unchanged
         */
        const receiverCheck = await pool.query(
            `
        SELECT balance
        FROM accounts
        WHERE id = $1
        `,
            [receiverAccountId]
        );

        expect(Number(receiverCheck.rows[0].balance)).toBe(1000);

        /*
         * No transaction should be created
         */
        const transactionResult = await pool.query(
            `
        SELECT id
        FROM transactions
        WHERE idempotency_key = $1
        `,
            [testIdempotencyKey]
        );

        expect(transactionResult.rows).toHaveLength(0);
    });
});