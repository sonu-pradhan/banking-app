import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();

        const sessionToken =
            cookieStore.get("session_token")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT
                u.*
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             WHERE s.session_token = $1
             AND s.expires_at > NOW()`,
            [sessionToken]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Invalid or expired session" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                user: result.rows[0],
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get current user error:", error);

        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}