import pool from "@/lib/db";

const PAGE_SIZE = 10;

export async function getTransactions(
  userId: string,
  accountId?: string,
  page: number = 1
) {
  const offset = (page - 1) * PAGE_SIZE;

  const accountsResult = await pool.query(
    `
      SELECT a.id, a.account_number, b.name AS "bankName"
      FROM accounts a
      LEFT JOIN banks b 
         ON b.id = a.bank_id
      WHERE a.user_id = $1
    `,
    [userId]
  );

  const accounts = accountsResult.rows;

  if (accounts.length === 0) {
    return {
      transactions: [],
      accounts: [],
      totalPages: 0,
      currentPage: page,
    };
  }

  let selectedAccountIds = accounts.map(
    (account) => account.id
  );

  if (accountId) {
    const selectedAccount = accounts.find(
      (account) => account.id === Number(accountId)
    );

    if (!selectedAccount) {
      throw new Error("Invalid account");
    }

    selectedAccountIds = [selectedAccount.id];
  }

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS count
      FROM transactions
      WHERE
        sender_account_id = ANY($1::int[])
        OR receiver_account_id = ANY($1::int[])
    `,
    [selectedAccountIds]
  );

  const totalTransactions = countResult.rows[0].count;
  const totalPages = Math.ceil(totalTransactions / PAGE_SIZE);

  const transactionsResult = await pool.query(
    `
      SELECT
        t.id,
        t.amount,
        t.status,
        t.created_at,
        t.sender_account_id,
        t.receiver_account_id,

        sender."firstName" AS sender_first_name,
        sender."lastName" AS sender_last_name,
        sender.email AS sender_email,

        receiver."firstName" AS receiver_first_name,
        receiver."lastName" AS receiver_last_name,
        receiver.email AS receiver_email

      FROM transactions t

      LEFT JOIN accounts sender_account
        ON sender_account.id = t.sender_account_id

      LEFT JOIN users sender
        ON sender.id = sender_account.user_id

      LEFT JOIN accounts receiver_account
        ON receiver_account.id = t.receiver_account_id

      LEFT JOIN users receiver
        ON receiver.id = receiver_account.user_id

      WHERE
        t.sender_account_id = ANY($1::int[])
        OR t.receiver_account_id = ANY($1::int[])

      ORDER BY t.created_at DESC

      LIMIT $2
      OFFSET $3
    `,
    [selectedAccountIds, PAGE_SIZE, offset]
  );

  const transactions = transactionsResult.rows.map((transaction) => {
    const isDebit = selectedAccountIds.includes(
      transaction.sender_account_id
    );

    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      status: transaction.status,
      createdAt: transaction.created_at,

      type: isDebit ? "debit" : "credit",

      person: isDebit
        ? {
            name: `${transaction.receiver_first_name} ${transaction.receiver_last_name}`,
            email: transaction.receiver_email,
          }
        : {
            name: `${transaction.sender_first_name} ${transaction.sender_last_name}`,
            email: transaction.sender_email,
          },
    };
  });

  return {
    transactions,
    accounts,
    totalPages,
    currentPage: page,
  };
}



export async function getFinancialActivity(userId: number) {
  const result = await pool.query(
    `
      SELECT
        TO_CHAR(DATE(t.created_at), 'DD Mon') AS date,

        COALESCE(
          SUM(
            CASE
              WHEN receiver_user.id = $1
              THEN t.amount
              ELSE 0
            END
          ),
          0
        ) AS credit,

        COALESCE(
          SUM(
            CASE
              WHEN sender_user.id = $1
              THEN t.amount
              ELSE 0
            END
          ),
          0
        ) AS debit

      FROM transactions t

      JOIN accounts sender
        ON sender.id = t.sender_account_id

      JOIN accounts receiver
        ON receiver.id = t.receiver_account_id

      JOIN users sender_user
        ON sender_user.id = sender.user_id

      JOIN users receiver_user
        ON receiver_user.id = receiver.user_id

      WHERE
        (sender_user.id = $1 OR receiver_user.id = $1)
        AND t.status = 'success'
        AND t.created_at >= CURRENT_DATE - INTERVAL '6 days'

      GROUP BY DATE(t.created_at)

      ORDER BY DATE(t.created_at)
    `,
    [userId]
  );

  return result.rows;
}