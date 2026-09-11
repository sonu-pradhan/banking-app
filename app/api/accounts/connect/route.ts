import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/user.action";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";


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

        const { bankId, paymentPin } = await request.json();

        if (!bankId || !paymentPin) {
            return NextResponse.json(
                { message: "Bank and payment PIN are required" },
                { status: 400 }
            );
        }

        if (!/^\d{4}$/.test(paymentPin)) {
            return NextResponse.json(
                { message: "Payment PIN must be exactly 4 digits" },
                { status: 400 }
            );
        }

        await client.query("BEGIN");

        const bankResult = await client.query(
            `SELECT id, name
             FROM banks
             WHERE id = $1`,
            [bankId]
        );

        if (bankResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Invalid bank selected" },
                { status: 400 }
            );
        }

        const bank = bankResult.rows[0];

        const existingAccount = await client.query(
            `SELECT id
             FROM accounts
             WHERE user_id = $1
             AND bank_id = $2`,
            [user.id, bankId]
        );

        if (existingAccount.rows.length > 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "You already have an account with this bank" },
                { status: 409 }
            );
        }


        let accountNumber: string;
        let accountExists = true;

        do {
            accountNumber = `12${randomInt(0, 10_000_000_000)
                .toString()
                .padStart(10, "0")}`;

            const result = await client.query(
                `SELECT id
                 FROM accounts
                 WHERE account_number = $1`,
                [accountNumber]
            );

            accountExists = result.rows.length > 0;
        } while (accountExists);

        
        const paymentPinHash = await bcrypt.hash(paymentPin, 10);

        const accountCountResult = await client.query(
            `SELECT COUNT(*)::int AS count
             FROM accounts
             WHERE user_id = $1`,
            [user.id]
        );

        const isFirstAccount = accountCountResult.rows[0].count === 0;

        const accountResult = await client.query(
            `INSERT INTO accounts (
                    user_id,
                    bank_id,
                    account_number,
                    payment_pin_hash
                 )
                VALUES ($1, $2, $3, $4)
                RETURNING
                   id,
                   user_id,
                   bank_id,
                   account_number`,
            [
                user.id,
                bankId,
                accountNumber,
                paymentPinHash,
            ]
        );

        const account = accountResult.rows[0];

       
        if (isFirstAccount) {
            await client.query(
                `UPDATE users
                 SET primary_account_id = $1
                 WHERE id = $2`,
                [account.id, user.id]
            );
        }

        await client.query("COMMIT");

        return NextResponse.json(
            {
                message: "Bank account connected successfully",
                account: {
                    ...account,
                    bank_name: bank.name,
                    is_primary: isFirstAccount,
                },
            },
            { status: 201 }
        );
        
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Connect bank account error:", error);

        return NextResponse.json(
            { message: "Failed to connect bank account" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}