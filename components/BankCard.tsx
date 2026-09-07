import { CreditCard, Nfc } from 'lucide-react';
import Link from 'next/link';

const BankCard = ({ account, userName }: { account: Account; userName: string }) => {
  return (
    <div className="flex flex-col">
      <Link href="/" className="relative flex h-48 w-[320px] justify-between rounded-[20px] border border-white bg-[#0179FE] shadow-[8px_10px_16px_0px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
        <div className="relative z-10 flex size-full max-w-58 flex-col justify-between rounded-l-[20px] bg-gray-700 bg-linear-to-r from-[#0179FE] to-[#4893FF] px-5 pb-4 pt-5">
          <div>
            <h1 className="text-16 font-semibold text-white">
              {account.name || userName}
            </h1>
            <p className="font-ibm-plex-serif font-black text-white">₹ {account.currentBalance}</p>
          </div>

          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">
                {userName}
              </h1>
              <h1 className="text-12 font-semibold text-white">
                ●● / ●●
              </h1>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">1234</span>
            </p>
          </article>
        </div>

        <div className="flex size-full flex-1 flex-col items-end justify-between rounded-r-[20px] bg-linear-to-r from-[#0179FE] to-[#4893FF] bg-cover bg-center bg-no-repeat py-5 pr-5 relative overflow-hidden">
          <div className="absolute -right-10 top-1/2 size-32 -translate-y-1/2 rounded-full border-20 border-white/10" />
          <div className="absolute -right-4 top-1/2 size-20 -translate-y-1/2 rounded-full border-10 border-white/10" />
          <Nfc size={32} className="relative z-10 text-white" />
          <div className="relative z-10 rounded-md bg-white p-1">
            <CreditCard
              size={24}
              className="text-amber-600"
            />
          </div>
        </div>
      </Link>
    </div>
  )
}

export default BankCard
