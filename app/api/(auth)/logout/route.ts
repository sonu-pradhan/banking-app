import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE() {
    try {
        const cookieStore = await cookies();

        const sessionToken = cookieStore.get("session_token")?.value;

        if (sessionToken) {
            await pool.query(
                `DELETE FROM sessions
                 WHERE session_token = $1`,
                [sessionToken]
            );
        }

        const response = NextResponse.json(
            {
                message: "Logged out successfully",
            },
            {
                status: 200,
            }
        );

        response.cookies.delete("session_token");

        return response;

    } catch (error) {
        console.error("Logout error:", error);

        return NextResponse.json(
            {
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}