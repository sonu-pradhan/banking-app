import { Plus } from "lucide-react"
import Link from "next/link"
import BankCard from "./BankCard"

interface RightSidebarProps {
    user: User;
    transactions: Transaction[];
    banks: Bank[] & Account[];
}

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
    console.log(user)
    return (
        <aside className="no-scrollbar w-100 hidden h-screen max-h-screen flex-col border-l border-gray-200 xl:flex w88 xl:overflow-y-scroll">
            <section className="flex flex-col pb-6">
                <div className="h-30 w-full bg-gradient" />
                <div className="relative flex px-6 max-xl:justify-center">
                    <div className="flex items-center justify-center absolute -top-8 size-18 rounded-full border-8 border-gray-100 p-2">
                        <span className="text-5xl font-bold text-blue-500">{user.firstName?.[0]?.toUpperCase()}</span>
                    </div>

                    <div className="flex flex-col pt-16">
                        <h1 className="text-20 font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-16 text-gray-600">{user.email}</p>
                    </div>
                </div>
            </section>

            <section className="flex flex-col justify-between gap-8 px-6">
                <div className="flex w-full justify-between">
                    <h2 className="text-15 font-semibold text-gray-900">My Banks</h2>
                    <Link href="/" className="flex gap-2 items-center">
                        <Plus size={18} />
                        <h2 className="text-12 font-semibold text-gray-600">Add Bank</h2>
                    </Link>
                </div>

                {banks?.length > 0 && (
                    <div className="relative h-55 w-90">
                        <div className="absolute left-0 top-0 z-10">
                            <BankCard
                                key={banks[0].id}
                                account={banks[0]}
                                userName={`${user.firstName} ${user.lastName}`}
                            />
                        </div>
                        {banks[1] && (
                            <div className="absolute right-0 top-8 z-0">
                                <BankCard
                                    key={banks[1].id}
                                    account={banks[1]}
                                    userName={`${user.firstName} ${user.lastName}`}
                                />
                            </div>
                        )}
                    </div>
                )}
            </section>
        </aside>
    )
}

export default RightSidebar

