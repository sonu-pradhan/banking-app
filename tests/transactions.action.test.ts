import { describe, expect, test, vi } from "vitest";

import { getTransactions } from "@/lib/transaction.action";
import pool from "../lib/db";

vi.mock("../lib/db", () => ({
    default: {
        query: vi.fn(),
    },
}));

const mockedQuery = vi.mocked(pool.query);

describe("getTransactions", () => {
    test("returns empty results when user has no accounts", async () => {
        mockedQuery.mockResolvedValueOnce({
            rows: [],
            rowCount: 0,
        } as any);

        const result = await getTransactions("user-123");

        expect(result).toEqual({
            transactions: [],
            accounts: [],
            totalPages: 0,
            currentPage: 1,
        });

        expect(mockedQuery).toHaveBeenCalledTimes(1);
    });

    test("returns a credit transaction with the sender as the person", async () => {
        mockedQuery
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 1,
                        account_number: "1234567890",
                        bankName: "SBI",
                    },
                ],
                rowCount: 1,
            } as any)
            .mockResolvedValueOnce({
                rows: [{ count: 1 }],
                rowCount: 1,
            } as any)
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 10,
                        amount: "500.00",
                        status: "success",
                        created_at: new Date("2026-09-24T10:00:00Z"),
                        sender_account_id: 2,
                        receiver_account_id: 1,

                        sender_first_name: "Rahul",
                        sender_last_name: "Sharma",
                        sender_email: "rahul@example.com",

                        receiver_first_name: "John",
                        receiver_last_name: "Doe",
                        receiver_email: "john@example.com",
                    },
                ],
                rowCount: 1,
            } as any);

        const result = await getTransactions("user-123");

        expect(result.transactions).toEqual([
            {
                id: 10,
                amount: 500,
                status: "success",
                createdAt: new Date("2026-09-24T10:00:00Z"),
                type: "credit",
                person: {
                    name: "Rahul Sharma",
                    email: "rahul@example.com",
                },
            },
        ]);

        expect(result.totalPages).toBe(1);
        expect(result.currentPage).toBe(1);
    });

    test("returns a debit transaction with the receiver as the person", async () => {
        mockedQuery
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 1,
                        account_number: "1234567890",
                        bankName: "SBI",
                    },
                ],
                rowCount: 1,
            } as any)
            .mockResolvedValueOnce({
                rows: [{ count: 1 }],
                rowCount: 1,
            } as any)
            .mockResolvedValueOnce({
                rows: [
                    {
                        id: 10,
                        amount: "750.00",
                        status: "success",
                        created_at: new Date("2026-09-24T10:00:00Z"),
                        sender_account_id: 1,
                        receiver_account_id: 2,

                        sender_first_name: "John",
                        sender_last_name: "Doe",
                        sender_email: "john@example.com",

                        receiver_first_name: "Rahul",
                        receiver_last_name: "Sharma",
                        receiver_email: "rahul@example.com",
                    },
                ],
                rowCount: 1,
            } as any);

        const result = await getTransactions("user-123");

        expect(result.transactions).toEqual([
            {
                id: 10,
                amount: 750,
                status: "success",
                createdAt: new Date("2026-09-24T10:00:00Z"),
                type: "debit",
                person: {
                    name: "Rahul Sharma",
                    email: "rahul@example.com",
                },
            },
        ]);
    });

    test("throws when the selected account does not belong to the user", async () => {
        mockedQuery.mockResolvedValueOnce({
            rows: [
                {
                    id: 1,
                    account_number: "1234567890",
                    bankName: "SBI",
                },
            ],
            rowCount: 1,
        } as any);

        await expect(
            getTransactions("user-123", "999")
        ).rejects.toThrow("Invalid account");

        expect(mockedQuery).toHaveBeenCalledTimes(1);
    });
});