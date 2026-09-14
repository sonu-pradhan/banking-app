"use client";

import React, { useState } from "react";
import { IndianRupee, Mail, Send, ShieldCheck } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";
import { toast } from "./ui/toast";



type PaymentTransferProps = {
  accounts: Account[];
  primaryAccount?: Account;
};

const PaymentTransfer = ({
  accounts,
  primaryAccount,
}: PaymentTransferProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(
    primaryAccount?.id ?? null
  );

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [idempotencyKey, setIdempotencyKey] = useState(
    () => crypto.randomUUID()
  );

  const selectedBank = accounts.find(
    (account) => account.id === selectedAccount
  );

  const router = useRouter();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedAccount) {
      setError("Please choose an account.");
      return;
    }

    if (!recipient.trim()) {
      setError("Please enter the recipient email or account number.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!pin) {
      setError("Please enter your payment PIN.");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch("/api/accounts/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",
        body: JSON.stringify({
          senderAccountId: selectedAccount,
          recipient: recipient.trim(),
          amount: Number(amount),
          pin,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.add({
          title: "Tranfered successfully",
          type: "success",
        });
        setIdempotencyKey(crypto.randomUUID());
        router.push("/transaction-history")
      } else {
        setError(data.message || "Transer failed");
        setRecipient("");
        setAmount("");
        setPin("");
      }

    } catch (error) {
      console.log("Transfer error:", error);

      setError("something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Choose your account</label>

        <Select
          value={selectedAccount}
          onValueChange={setSelectedAccount}
        >
          <SelectTrigger className="h-12 w-full rounded-xl">
            <SelectValue>
              {selectedBank?.bankName ?? "Select your bank account"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex items-center gap-3">
                  <span>{account.bankName}</span>

                  <span className="text-xs text-gray-400">
                    **** {account.accountNumber.toString().slice(-4)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedBank && (
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-xs text-gray-500">
              Available balance
            </span>

            <span className="text-sm font-semibold">
              ₹ {selectedBank.balance}
            </span>
          </div>
        )}
      </div>


      <div className="space-y-2">
        <label className="text-sm font-medium">
          Recipient email or account number
        </label>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="text"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="example@email.com or account number"
            className="h-12 rounded-xl pl-11"
          />
        </div>

        <p className="text-xs text-gray-400">
          Enter the email address or bank account number of the recipient.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount</label>

        <div className="relative">
          <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="h-12 rounded-xl pl-11 text-lg font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Payment PIN
        </label>

        <div className="relative">
          <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Enter your account PIN"
            className="h-12 rounded-xl pl-11 tracking-[0.35em]"
          />
        </div>

        <p className="text-xs text-gray-400">
          Your PIN is required to authorize this transaction.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full cursor-pointer rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-700"
      >
        {
          loading ? (
            "Processing..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Money
            </>
          )
        }
      </Button>
    </form>
  );
};

export default PaymentTransfer;