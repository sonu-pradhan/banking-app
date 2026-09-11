"use client";

import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";


const banks = [
    { id: 1, name: "State Bank of India" },
    { id: 2, name: "HDFC Bank" },
    { id: 3, name: "ICICI Bank" },
    { id: 4, name: "Union Bank of India" },
    { id: 5, name: "Axis Bank" },
    { id: 6, name: "Punjab National Bank" },
    { id: 7, name: "Bank of India" },
];


export default function ConnectAccount() {
    const [bankId, setBankId] = useState("");
    const [paymentPin, setPaymentPin] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await fetch("/api/accounts/connect", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bankId: Number(bankId),
                    paymentPin,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.add({
                    title: data.message,
                    type: "success",
                });
                window.location.href = "/";
            } else {
                toast.add({
                    title: data.message,
                    type: "error",
                });
            }
        } catch (error) {

            toast.add({
                title: "Something went wrong",
                type: "error",
            });

        } finally {
            setLoading(false);
        };
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">

            <div className="space-y-2">
                <Label htmlFor="bank">Select Bank</Label>

                <Select value={bankId}
                    onValueChange={(value) => setBankId(value ?? "")}
                >
                    <SelectTrigger id="bank" className="w-full">
                        <SelectValue placeholder="Select your bank">
                            {banks.find((bank) => String(bank.id) === bankId)?.name}
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {banks.map((bank) => (
                            <SelectItem key={bank.id} value={String(bank.id)}>
                                {bank.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="paymentPin">Create Payment PIN</Label>

                <Input
                    id="paymentPin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={paymentPin}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setPaymentPin(value);
                    }}
                />
            </div>

            <Button
                type="submit"
                className="h-11 w-full rounded-lg border border-[#0179FE] bg-linear-to-r from-[#0179FE] to-[#4893FF] text-base font-semibold text-white"
                disabled={loading}
            >
                {loading ? "Connecting..." : "Connect Bank"}
            </Button>
        </form>
    );
}