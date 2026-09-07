import BalanceBox from "@/components/BalanceBox"
import HeaderBox from "@/components/HeaderBox"
import RightSidebar from "@/components/RightSidebar"
import { User } from "lucide-react"

const HomePage = () => {
  const loggedIn = { firstName: "Akash", lastName: "Singh", email: "akash@gmail.com" }

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
            accounts={[]}
            totalBanks={1}
            currentBalance={3424.34}
          />
        </header>
      </div>

      <RightSidebar
        user ={loggedIn}
        transactions={[]}
        banks ={[{currentBalance: 3490.49}, {currentBalance:2785.98}]}
      />
    </section>
  )
}

export default HomePage
