"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/user.action";

export async function setPrimaryAccount(
    accountId: string,
    _formData: FormData
): Promise<void> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error("User is not authenticated");
        }

        const account = await pool.query(
            `SELECT id FROM accounts WHERE id = $1 AND user_id = $2`,
            [accountId, user.id]
        );

        if (account.rowCount === 0) {
            throw new Error("Account does not belong to this user");
        }

        await pool.query(
            `UPDATE users SET primary_account_id = $1 WHERE id = $2`,
            [accountId, user.id]
        );


        revalidatePath("/my-banks");
        revalidatePath("/");

    } catch (error) {
        console.error("Set primary account error:", error);
        throw error;
    }
}