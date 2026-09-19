import { ArrowRight, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPrimaryAccount } from "@/lib/account.action";
import SetPrimaryButton from "./SetPrimaryButton";

interface OtherAccountProps {
  bankName: string;
  accountNumber: number;
  balance: number;
  id: string;
}

const OtherAccounts = ({
  bankName,
  id,
  accountNumber,
  balance,
}: OtherAccountProps) => {
  return (
    <div className="grid items-center gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 lg:grid-cols-[1fr_180px_1fr]">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
          <span className="text-lg font-bold text-blue-600">
            {bankName.charAt(0)}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">{bankName}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {accountNumber}
          </p>
        </div>
      </div>

      <div className="lg:min-w-40 mr-10 lg:text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Available balance
        </p>

        <p className="mt-1 text-lg font-bold text-gray-900">
          ₹ {balance}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
        <form action={setPrimaryAccount.bind(null, id)}>
          <SetPrimaryButton />
        </form>

      </div>
    </div>
  );
};

export default OtherAccounts;