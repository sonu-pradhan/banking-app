/**
 * @vitest-environment jsdom
 */
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentTransfer from "@/components/PaymentTransfer";

import { vi } from "vitest";

const mockPush = vi.hoisted(() => vi.fn());
const mockToastAdd = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock("@/components/ui/toast", () => ({
    toast: {
        add: mockToastAdd,
    },
}));
const accounts = [
    {
        id: "1",
        bankName: "State Bank of India",
        accountNumber: 123456789012,
        balance: 50000,
    },
];

describe("PaymentTransfer", () => {
    test("renders the transfer form", () => {
        render(
            <PaymentTransfer
                accounts={accounts}
                primaryAccount={accounts[0]}
            />
        );

        expect(
            screen.getByText("Choose your account")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Recipient email or account number")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Amount")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Payment PIN")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /send money/i })
        ).toBeInTheDocument();
    });

    test("shows an error when recipient is empty", async () => {
        const user = userEvent.setup();

        render(
            <PaymentTransfer
                accounts={accounts}
                primaryAccount={accounts[0]}
            />
        );

        const sendButton = screen.getByRole("button", {
            name: /send money/i,
        });

        await user.click(sendButton);

        expect(
            screen.getByText(
                "Please enter the recipient email or account number."
            )
        ).toBeInTheDocument();
    });

    test("submits the transfer form with the correct data", async () => {
        const user = userEvent.setup();

        const fetchMock = vi
            .spyOn(global, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify({
                        message: "Transfer successful",
                    }),
                    {
                        status: 201,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            );

        render(
            <PaymentTransfer
                accounts={accounts}
                primaryAccount={accounts[0]}
            />
        );

        const recipientInput = screen.getByPlaceholderText(
            "example@email.com or account number"
        );

        const amountInput = screen.getByPlaceholderText("0.00");

        const pinInput = screen.getByPlaceholderText(
            "Enter your account PIN"
        );

        await user.type(
            recipientInput,
            "receiver@example.com"
        );

        await user.type(amountInput, "500");

        await user.type(pinInput, "1234");

        await user.click(
            screen.getByRole("button", {
                name: /send money/i,
            })
        );

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/accounts/transfer",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: expect.any(String),
            })
        );

        const fetchBody = JSON.parse(
            fetchMock.mock.calls[0][1]?.body as string
        );

        expect(fetchBody).toEqual({
            senderAccountId: "1",
            recipient: "receiver@example.com",
            amount: 500,
            pin: "1234",
            idempotencyKey: expect.any(String),
        });

        fetchMock.mockRestore();
    });

    test("shows the API error and clears the form when transfer fails", async () => {
        const user = userEvent.setup();

        const fetchMock = vi
            .spyOn(global, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify({
                        message: "Invalid payment PIN",
                    }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            );

        render(
            <PaymentTransfer
                accounts={accounts}
                primaryAccount={accounts[0]}
            />
        );

        const recipientInput = screen.getByPlaceholderText(
            "example@email.com or account number"
        );

        const amountInput = screen.getByPlaceholderText("0.00");

        const pinInput = screen.getByPlaceholderText(
            "Enter your account PIN"
        );

        await user.type(
            recipientInput,
            "receiver@example.com"
        );

        await user.type(amountInput, "500");

        await user.type(pinInput, "9999");

        await user.click(
            screen.getByRole("button", {
                name: /send money/i,
            })
        );

        expect(
            await screen.findByText("Invalid payment PIN")
        ).toBeInTheDocument();

        expect(recipientInput).toHaveValue("");
        expect(amountInput).toHaveValue(null);
        expect(pinInput).toHaveValue("");

        fetchMock.mockRestore();
    });

    test("redirects after a successful transfer", async () => {
        const user = userEvent.setup();

        const fetchMock = vi
            .spyOn(global, "fetch")
            .mockResolvedValue(
                new Response(
                    JSON.stringify({
                        message: "Transfer successful",
                    }),
                    {
                        status: 201,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
            );

        render(
            <PaymentTransfer
                accounts={accounts}
                primaryAccount={accounts[0]}
            />
        );

        await user.type(
            screen.getByPlaceholderText(
                "example@email.com or account number"
            ),
            "receiver@example.com"
        );

        await user.type(
            screen.getByPlaceholderText("0.00"),
            "500"
        );

        await user.type(
            screen.getByPlaceholderText("Enter your account PIN"),
            "1234"
        );

        await user.click(
            screen.getByRole("button", {
                name: /send money/i,
            })
        );

        expect(mockToastAdd).toHaveBeenCalledWith({
            title: "Tranfered successfully",
            type: "success",
        });

        expect(mockPush).toHaveBeenCalledWith(
            "/transaction-history"
        );

        fetchMock.mockRestore();
    });
});