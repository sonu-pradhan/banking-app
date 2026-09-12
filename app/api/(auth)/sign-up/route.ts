import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    try {
        
        const { firstName, lastName, email, password, address, city, state, pinCode, dateOfBirth } = await request.json();

        if (!firstName || !lastName || !email || !password || !address || !city || !state || !pinCode || !dateOfBirth) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            )
        }

        const existingUser = await pool.query(
            `SELECT id FROM users
            WHERE email = $1`,
            [email]
        );

        if (existingUser.rows.length > 0 ) {
            return NextResponse.json(
                { message : "User already exists" },
                { status: 404 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users ("firstName", "lastName", email, password_hash, address, city, state, "pinCode", "dateOfBirth") 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [firstName, lastName, email, passwordHash, address, city, state, pinCode, dateOfBirth]
        )

        return NextResponse.json(
            { message: "Account created successfully"},
            { status: 201}
        );
        
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }    
}