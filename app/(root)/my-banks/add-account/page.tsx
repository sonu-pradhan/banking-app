import ConnectAccount from "@/components/ConnectAccount";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AddAccount = () => {
  return (
    <section className="w-full px-4 mt-5 py-8 sm:px-6 lg:px-10">
       <Link
          href="/my-banks"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">

          <h1 className="mt-1 text-30 font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Connect a new account
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Securely connect another bank account to manage your finances
            from one place.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <ConnectAccount />
        </div>

      </div>
    </section>
  );
};

export default AddAccount;