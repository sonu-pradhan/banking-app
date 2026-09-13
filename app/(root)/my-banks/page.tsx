import { ArrowRight, Landmark, Plus} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import OtherAccounts from "@/components/OtherAccounts";
import { getCurrentUser } from "@/lib/user.action";

const MyBanks = async () => {
  
  const user = await getCurrentUser()

  const accounts = user?.accounts
  
  const primaryAccount = accounts.find((account: Account ) => account.isPrimary === true );

  const otherAccounts = accounts.filter((account: Account) => account.isPrimary === false );

  return (
    <section className="w-full md:mt-6 space-y-8 px-4 py-6 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-30 font-bold sm:text-20 sm:tracking-tight tracking-wide text-gray-900">
            My accounts
          </h1>

          <p className="mt-1 text-12 text-gray-500 sm:text-base">
            Effortlessly manage your banking activities.
          </p>
        </div>

        <Button className="w-full mr-10 gap-2 mt-4 bg-blue-600 shadow-sm hover:bg-blue-700 sm:w-auto cursor-pointer">
          <Plus className="size-4" />
          Add account
        </Button>
      </div>

      
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Primary account
          </h2>
        </div>

        <div className="group relative min-h-75 overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
          {/* Main gradient glow */}
          <div className="pointer-events-none absolute -right-24 -top-40 h-108 w-108 rounded-full bg-[conic-gradient(from_135deg,#ffffff_0deg,#ffffff_35deg,#f5f3ff_80deg,#ede9fe_130deg,#ddd6fe_180deg,#c4b5fd_225deg,#bfdbfe_270deg,#dbeafe_315deg,#ffffff_360deg)] opacity-80 blur-[2px]" />

          {/* Secondary soft glow */}
          <div className="pointer-events-none absolute -bottom-40 -left-32 size-90 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.7)_0%,rgba(224,231,255,0.35)_40%,transparent_70%)]" />

          {/* Decorative gradient orb */}
          <div className="pointer-events-none absolute right-10 top-8 size-32 rounded-full bg-white/30 blur-2xl" />

          {/* Decorative rings */}
          <div className="pointer-events-none absolute -right-8 top-12 size-44 rounded-full border border-white/40" />

          <div className="pointer-events-none absolute -right-16 top-20 size-56 rounded-full border border-white/30" />

          {/* Content */}
          <div className="relative flex min-h-75 flex-col justify-between p-6 sm:p-8">

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-gray-100 backdrop-blur-sm">
                  <Landmark className="size-6 text-blue-600" />
                </div>

                <div>
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-600 shadow-sm backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-blue-500" />
                    Primary
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    {primaryAccount?.bankName}
                  </h3>
                </div>
              </div>

              <div className="hidden items-center gap-1 sm:flex">
                <span className="size-2 rounded-full bg-gray-300" />
                <span className="size-2 rounded-full bg-gray-300" />
                <span className="size-2 rounded-full bg-blue-400" />
              </div>
            </div>

            <div className="mt-10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                Available balance
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                ₹ {primaryAccount?.balance}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-5 border-t border-gray-200/70 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Account number
                </p>

                <p className="mt-1 font-mono text-sm font-medium tracking-[0.2em] text-gray-700">
                 {primaryAccount?.accountNumber}
                </p>
              </div>

              <Link
                href="/transaction-history"
                className="group/link inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Show transactions

                <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {otherAccounts.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Other accounts
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your linked bank accounts.
              </p>
            </div>

            <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 sm:block">
             other accounts : {otherAccounts.length} 
            </span>
          </div>

          <div className="space-y-3">
            {otherAccounts.map((account: Account) => (
              <OtherAccounts
                key={account?.id}
                bankName={account?.bankName}
                accountNumber={account?.accountNumber}
                balance={account?.balance}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default MyBanks;