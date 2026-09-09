import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";


export async function POST (request: Request) {

    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { message: "All fields are required" },
            { status: 400 }
        )
    }

    const existingUser = await pool.query(
        `SELECT * FROM users
        WHERE email=$1`,
        [email]
    );
    if(existingUser.rows.length === 0 ){
        return NextResponse.json(
            { message: "Account does not exist "},
            { status: 404 }
        );
    }

    const user = existingUser.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
        return NextResponse.json(
            { message: "Incorrect id or password" },
            { status: 401 }
        );
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
        `INSERT INTO sessions (session_token, user_id, expires_at)
        VALUES ($1, $2, $3)`,
        [sessionToken, user.id, expiresAt]
    );

    const response = NextResponse.json(
        { message: "Welcome Back" ,
        user },
        { status: 201}
    );

    response.cookies.set("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });

    return response;
    
}