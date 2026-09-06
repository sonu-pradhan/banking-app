import BalanceBox from "@/components/BalanceBox"
import HeaderBox from "@/components/HeaderBox"

const HomePage = () => {
  const loggedIn = { firstName: "Akash" }

  return (
    <section className="no-scrollbar flex w-full flex-row max-xl:max-h-screen max-xl:overflow-y-scroll">
      <div className="no-scrollbar flex w-full flex-1 flex-col gap-8 px-5 sm:px-8 py-7 lg:py-12 xl:max-h-screen xl:overflow-y-scroll">
        <header className="flex flex-col justify-between gap-8">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "User"}
            subtext="Access and manage your account and transactions efficiently"
          />
        </header>

        <BalanceBox
        accounts={[]}
        totalBanks={1}
        currentBalance={3424.34}
        />
      </div>
    </section>
  )
}

export default HomePage
