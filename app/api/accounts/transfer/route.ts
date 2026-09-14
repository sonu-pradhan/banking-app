import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/user.action";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            senderAccountId,
            recipient,
            amount,
            pin,
            idempotencyKey,
        } = body;

        if (!senderAccountId || !recipient || !amount || !pin || !idempotencyKey) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        const transferAmount = Number(amount);

        if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
            return NextResponse.json(
                { message: "Transfer amount must be greater than 0" },
                { status: 400 }
            );
        }

        await client.query("BEGIN");

        const senderResult = await client.query(
            `
              SELECT id, user_id, account_number, balance, payment_pin_hash
              FROM accounts
              WHERE id = $1
              FOR UPDATE
            `,
            [senderAccountId]
        );

        if (senderResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Sender account not found" },
                { status: 404 }
            );
        }

        const sender = senderResult.rows[0];

        if (sender.user_id !== user.id) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "You do not own this account" },
                { status: 403 }
            );
        }

        if (transferAmount > Number(sender.balance)) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Insufficient account balance" },
                { status: 400 }
            );
        }

        const isMatch = await bcrypt.compare(pin, sender.payment_pin_hash);
        if (!isMatch) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Invalid payment PIN" },
                { status: 401 }
            );
        }

        let receiver;

        const isEmail = recipient.includes("@");

        if (isEmail) {
            const receiverUserResult = await client.query(
                `
                  SELECT id, primary_account_id
                  FROM users
                  WHERE email = $1
                `,
                [recipient.toLowerCase().trim()]
            );

            if (receiverUserResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Recipient user not found" },
                    { status: 404 }
                );
            }

            const receiverUser = receiverUserResult.rows[0];

            if (!receiverUser.primary_account_id) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Recipient does not have a primary account" },
                    { status: 400 }
                );
            }

            const receiverResult = await client.query(
                `
                  SELECT id, user_id, account_number, balance
                  FROM accounts
                  WHERE id = $1
                  FOR UPDATE
                `,
                [receiverUser.primary_account_id]
            );

            if (receiverResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Recipient primary account not found" },
                    { status: 404 }
                );
            }

            receiver = receiverResult.rows[0];
        } else {
            const receiverResult = await client.query(
                `
                   SELECT id, user_id, account_number, balance
                   FROM accounts
                   WHERE account_number = $1
                   FOR UPDATE
                `,
                [recipient.trim()]
            );

            if (receiverResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Recipient account not found" },
                    { status: 404 }
                );
            }

            receiver = receiverResult.rows[0];
        }

        if (sender.id === receiver.id) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "You cannot transfer money to the same account" },
                { status: 400 }
            );
        }

        await client.query(
            `
              UPDATE accounts
              SET balance = balance - $1
              WHERE id = $2
            `,
            [transferAmount, sender.id]
        );

        await client.query(
            `
             UPDATE accounts
             SET balance = balance + $1
             WHERE id = $2
            `,
            [transferAmount, receiver.id]
        );

        try {
            const transactionResult = await client.query(
                `
              INSERT INTO transactions (
                sender_account_id,
                receiver_account_id,
                amount,
                status,
                idempotency_key
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
                [
                    sender.id,
                    receiver.id,
                    transferAmount,
                    "success",
                    idempotencyKey
                ]
            );
        } catch (error: any) {
            if (error.code === "23505") {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "This transfer has already been processed" },
                    { status: 409 }
                );
            }

            throw error;
        }

        await client.query("COMMIT");

        return NextResponse.json(
            {
                message: "Transfer successful"
            },
            { status: 201 }
        );

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Transaction error:", error);

        return NextResponse.json(
            { message: "Something went wrong while processing the transfer" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}