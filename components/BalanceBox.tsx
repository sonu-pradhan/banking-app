import AnimatedCounter from "./AnimatedCounter"
import BalanceChart from "./BalanceChart"

interface BalanceBoxProps {
    accounts: Account[],
    totalBanks: number,
    currentBalance: number
}

const BalanceBox = ({
    accounts = [], totalBanks, currentBalance
}: BalanceBoxProps) => {
    return (
        <section className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 shadow-chart sm:gap-6 sm:p-6">
            <div className="flex size-full max-w-25 items-center sm:max-w-30">
                <BalanceChart accounts={accounts} />
            </div>

            <div className="flex flex-col gap-6">
                <h2 className="text-18 font-semibold text-gray-900">
                    Bank Accounts: {totalBanks}
                </h2>
                <div className="flex flex-col gap-2">
                    <p className="text-14 font-medium text-gray-600">
                        Current Balance
                    </p>

                    <div className="text-24 lg:text-30 flex-1 font-semibold text-gray-900 flex-center gap-2">
                        <AnimatedCounter amount={currentBalance} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BalanceBox
