import BalanceBox from "@/components/BalanceBox"
import HeaderBox from "@/components/HeaderBox"

const HomePage = () => {
  const loggedIn = { firstName: "Akash" }

  return (
    <section className="min-h-screen w-full">
      <div className="flex w-full flex-col gap-8 py-3 px-6 sm:px-8 lg:px-10 lg:py-12">
        <header className="flex flex-col justify-between gap-8">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "User"}
            subtext="Access and manage your account and transactions efficiently"
          />

          <BalanceBox
            accounts={[]}
            totalBanks={1}
            currentBalance={3424.34}
          />
        </header>
      </div>
    </section>
  )
}

export default HomePage
