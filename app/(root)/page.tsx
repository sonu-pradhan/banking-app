import BalanceBox from "@/components/BalanceBox"
import FinancialActivity from "@/components/FinancialActivity"
import HeaderBox from "@/components/HeaderBox"
import RightSidebar from "@/components/RightSidebar"
import { getFinancialActivity } from "@/lib/transaction.action"
import { getCurrentUser } from "@/lib/user.action"

const HomePage = async () => {

  const loggedIn = await getCurrentUser();

  const totalBalance = loggedIn?.accounts.reduce((total:number, account:Account) => {
    return total + account.balance;
  }, 0);

  const financialActivity = loggedIn
    ? await getFinancialActivity(loggedIn.id)
    : [];

  return (
    <section className="flex min-h-screen w-full">
      <div className="flex flex-1 flex-col gap-8 py-3 px-6 sm:px-8 lg:px-10 lg:py-12">
        <header className="flex flex-col justify-between gap-8">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "User"}
            subtext="Access and manage your account and transactions efficiently"
          />

          <BalanceBox
            accounts={loggedIn?.accounts}
            totalBanks={loggedIn?.accounts.length}
            currentBalance={totalBalance}
          />
        </header>

        <FinancialActivity data={financialActivity} />

      </div>

      <RightSidebar
        user={loggedIn}
        transactions={[]}
        bankAccounts={loggedIn?.accounts}
      />
    </section>
  )
}

export default HomePage
