"use client"

import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Footer from "./Footer"

const Sidebar = ({ user }: { user: User }) => {

    const pathname = usePathname();

    return (
        <section className="sticky left-0 top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white px-4 py-8 md:flex xl:w-72 2xl:w-80">
            <nav className="flex flex-col gap-4">
                <Link href="/" className="mb-10 flex cursor-pointer items-center gap-2">
                    <Image
                        src="/logo.jpeg"
                        width={34}
                        height={34}
                        alt="Ledge Meridian Logo"
                        className="size-8"
                    />
                    <h1 className="font-ibm-plex-serif mid:text-[26px] font-bold text-black xl:text-[28px]">Ledge Meridian</h1>
                </Link>

                {sidebarLinks.map((item) => {

                    const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

                    const Icon = item.imgURL

                    return (
                        <Link
                            href={item.route}
                            key={item.label}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3",
                                isActive
                                    ? "bg-[#0179FE] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}>
                            <Icon
                                className={cn(
                                    "size-5",
                                    isActive ? "text-white" : "text-gray-600"
                                )}
                            />

                            <p className={cn("text-16 font-semibold text-black-2", { "text-white!": isActive })}>
                                {item.label}
                            </p>
                        </Link>
                    )
                })}
            </nav>

            <Footer user={user} />
        </section>
    )
}

export default Sidebar
