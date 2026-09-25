"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
} from "lucide-react";

import { cn } from "@/lib/utils";


type TransactionResponse = {
  transactions: Transaction[];
  accounts: Account[];
  totalPages: number;
  currentPage: number;
};

const TransactionHistory = () => {
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [accountId, setAccountId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        params.set("page", page.toString());

        if (accountId) {
          params.set("accountId", accountId);
        }

        const response = await fetch(
          `/api/accounts/transactions?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId, page]);

  const handleAccountChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAccountId(event.target.value);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            Money movement
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Track your recent credits, debits, and transfers.
          </p>
        </div>

        <div className="min-w-60">
          <label
            htmlFor="account"
            className="mb-2 block text-xs font-medium text-muted-foreground"
          >
            Filter by account
          </label>

          <div className="relative">
            <CreditCard
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <select
              id="account"
              value={accountId}
              onChange={handleAccountChange}
              className="h-11 w-full cursor-pointer rounded-xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            >
              <option value="">All accounts</option>

              {data?.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Clock3 size={18} />

            <h2 className="font-medium">
              Recent Transactions
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : data?.transactions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Clock3 size={24} className="text-muted-foreground" />
            </div>

            <h3 className="font-medium">
              No transactions yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Your transaction history will appear here.
            </p>
          </div>
        ) : (
          <div>
            {data?.transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Page {data.currentPage} of {data.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                disabled={page === data.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

function TransactionItem({
  transaction,
}: {
  transaction: Transaction;
}) {
  const isDebit = transaction.type === "debit";

  const formattedDate = new Date(
    transaction.createdAt
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group relative mx-2 my-2 grid grid-cols-[40px_minmax(0,1fr)_30%] items-center rounded-2xl border border-transparent px-2 py-4 transition-all duration-200 hover:border-border hover:bg-linear-to-r hover:from-background hover:via-muted/50 hover:to-background hover:shadow-sm sm:mx-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-6 sm:px-4">
      
      <div className="contents sm:flex sm:min-w-0 sm:items-center sm:gap-4">
        <div
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-11 sm:w-11 transition-transform duration-200 group-hover:scale-105",
            isDebit
              ? "bg-orange-100 text-orange-600 shadow-[0_0_0_5px_rgba(249,115,22,0.08)]"
              : "bg-emerald-100 text-emerald-600 shadow-[0_0_0_5px_rgba(16,185,129,0.08)]"
          )}
        >
          {isDebit ? (
            <ArrowUpRight size={20} strokeWidth={2.2} />
          ) : (
            <ArrowDownLeft size={20} strokeWidth={2.2} />
          )}
        </div>

        <div className="min-w-0 pr-2 max-sm:col-start-2">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">
              {transaction.person.name}
            </p>

            <span
              className={cn(
                "hidden rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:inline-flex",
                isDebit
                  ? "bg-orange-50 text-orange-600"
                  : "bg-emerald-50 text-emerald-600"
              )}
            >
              {isDebit ? "Debit" : "Credit"}
            </span>
          </div>

          <p className="truncate text-sm text-muted-foreground">
            {transaction.person.email}
          </p>
        </div>
      </div>

      <div className="text-right max-sm:col-start-3 max-sm:row-start-1">
        <p
          className={cn(
            "whitespace-nowrap text-base font-bold tracking-tight",
            isDebit ? "text-orange-600" : "text-emerald-600"
          )}
        >
          {isDebit ? "-" : "+"} ₹
          {transaction.amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </p>

        {isDebit && (
          <span
            className={cn(
              "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize",
              transaction.status === "success" &&
                "bg-emerald-50 text-emerald-600",
              transaction.status === "failed" &&
                "bg-red-50 text-red-500"
            )}
          >
            {transaction.status}
          </span>
        )}
      </div>

      <div className="min-w-0 text-right max-sm:col-start-3 max-sm:row-start-2">
        <p className="text-[10px] font-medium leading-tight sm:text-xs text-muted-foreground">
          {formattedDate}
        </p>
      </div>
    </div>
  );
}

export default TransactionHistory;