import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import PaymentTransfer from "@/components/PaymentTransfer";
import { getCurrentUser } from "@/lib/user.action";


const PaymentTransferPage = async () => {

  const user = await getCurrentUser();

  const accounts:Account[] = user?.accounts ?? [];

  const primaryAccount = accounts?.find(
    (account) => account.id === user?.primary_account_id
  );

  return (
    <section className="flex w-full flex-col gap-8 p-6 md:p-8">

      <div>
        <p className="mb-2 text-sm font-medium text-blue-600">
          Transfer Securely
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Send money securely from one of your connected bank accounts.
        </p>
      </div>

      <div className="grid w-full gap-6 lg:grid-cols-[1fr_320px]">
        <div className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-purple-100/50 blur-3xl" />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold">Make a transfer</h2>
                <p className="text-sm text-gray-500">
                  Enter the recipient and payment details
                </p>
              </div>
            </div>

            <PaymentTransfer
              accounts={accounts}
              primaryAccount={primaryAccount}
            />
          </div>
        </div>

        {/* Right information card */}
        <div className="hidden md:flex flex-col gap-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <h3 className="font-semibold">Secure transfer</h3>
                <p className="text-xs text-gray-500">
                  Your payment is protected
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Payment PIN required</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Recipient verification</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Transaction history maintained</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed p-5">
            <div className="flex items-start gap-3">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

              <p className="text-xs leading-5 text-gray-500">
                You can send money using either the recipient&apos;s email
                address or their bank account number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentTransferPage;