import { describe, expect, test, vi } from "vitest";

import { setPrimaryAccount } from "../lib/account.action";
import pool from "../lib/db";
import { getCurrentUser } from "../lib/user.action";
import { revalidatePath } from "next/cache";

vi.mock("../lib/db", () => ({
    default: {
        query: vi.fn(),
    },
}));

vi.mock("../lib/user.action", () => ({
    getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", async () => {
    const actual = await vi.importActual<typeof import("next/cache")>("next/cache");

    return {
        ...actual,
        revalidatePath: vi.fn(),
    };
});

const mockedQuery = vi.mocked(pool.query);
const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedRevalidatePath = vi.mocked(revalidatePath);

test("throws when user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    await expect(
        setPrimaryAccount("account-123", new FormData())
    ).rejects.toThrow("User is not authenticated");
});

test("throws when account does not belong to the user", async () => {
    mockedGetCurrentUser.mockResolvedValue({
        id: "user-123",
    } as any);

    mockedQuery.mockResolvedValueOnce({
        rowCount: 0,
        rows: [],
    } as any);

    await expect(
        setPrimaryAccount("account-123", new FormData())
    ).rejects.toThrow("Account does not belong to this user");
});

test("sets the account as primary", async () => {
    mockedGetCurrentUser.mockResolvedValue({
        id: "user-123",
    } as any);

    mockedQuery
        .mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ id: "account-123" }],
        } as any)
        .mockResolvedValueOnce({
            rowCount: 1,
            rows: [],
        } as any);

    await setPrimaryAccount("account-123", new FormData());

    expect(mockedQuery).toHaveBeenCalledTimes(2);

    expect(mockedQuery).toHaveBeenNthCalledWith(
        1,
        `SELECT id FROM accounts WHERE id = $1 AND user_id = $2`,
        ["account-123", "user-123"]
    );

    expect(mockedQuery).toHaveBeenNthCalledWith(
        2,
        `UPDATE users SET primary_account_id = $1 WHERE id = $2`,
        ["account-123", "user-123"]
    );

    expect(mockedRevalidatePath).toHaveBeenCalledWith("/my-banks");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
});