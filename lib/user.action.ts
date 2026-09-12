import { cookies } from "next/headers";
import pool from "./db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_token")?.value;

  if (!sessionId) {
    return null;
  }

  const result = await pool.query(
    `SELECT 
            u.*
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.session_token = $1
         AND s.expires_at > NOW()`,
    [sessionId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const userId = result.rows[0].id


  const data = await pool.query(
    `
      SELECT
         u.id,
         u."firstName",
         u."lastName",
         u.email,
         u.primary_account_id,

        COALESCE(
           json_agg(
             json_build_object(
                 'id', a.id,
                 'accountNumber', a.account_number,
                 'balance', a.balance,
                 'bankName', b.name,
                 'isPrimary', a.id = u.primary_account_id
              )
           ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
         ) AS accounts

      FROM users u

      LEFT JOIN accounts a
          ON a.user_id = u.id

      LEFT JOIN banks b
          ON b.id = a.bank_id

      WHERE u.id = $1

      GROUP BY u.id;
      `, [userId]
  )

  return data.rows[0];

}


export async function logoutUser() {
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

    cookieStore.delete("session_token");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}