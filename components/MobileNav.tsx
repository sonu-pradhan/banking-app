"use client"

import { Menu, User } from "lucide-react"
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"
import Image from "next/image"
import Link from "next/link"
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "./ui/toast"

const MobileNav = ({ user }: { user: User }) => {

    const [open, setOpen] = useState(false);


    const pathname = usePathname();

    const router = useRouter();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/logout", {
                method: "DELETE",
            });

            const result = await response.json();

            if (response.ok) {
                toast.add({
                    title: result.message,
                    type: "success",
                });
            }
        } catch (error) {
            console.error(error);
            toast.add({
                title: "Something went wrong",
                type: "error",
            });
        } finally {
            setOpen(false)
            router.push("/sign-in")
        }
    }
    return (
        <section>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger render={<Button size="lg" className="rounded-2xl  bg-white" variant="outline"><Menu /></Button>} />
                <SheetContent>
                    <Link href="/" onClick={() => setOpen(false)} className="py-4 px-2 flex cursor-pointer items-center gap-2">
                        <Image
                            src="/logo.jpeg"
                            width={34}
                            height={34}
                            alt="Ledge Meridian Logo"
                            className="size-8"
                        />
                        <h1 className="font-ibm-plex-serif font-bold text-[#0179FE] text-xl xl:text-[28px]">Ledge Meridian</h1>
                    </Link>

                    {sidebarLinks.map((item) => {

                        const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

                        const Icon = item.imgURL

                        return (
                            <Link
                                href={item.route}
                                key={item.label}
                                onClick={() => setOpen(false)}
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

                    <SheetFooter>
                        {
                            user ?
                                (
                                    <>
                                        <div className="flex flex-row items-center gap-3 rounded-lg px-4 py-4">
                                            <User size={34} />
                                            <div>
                                                <h1 className="text-14 font-semibold text-gray-800">{user?.firstName} {user?.lastName}</h1>
                                                <h1 className="text-gray-600">{user?.email}</h1>
                                            </div>
                                        </div>
                                        <Button variant="destructive" type="submit" className="mb-10" onClick={handleLogout}>Logout</Button>
                                    </>
                                )
                                :
                                (
                                    <Link href={"/sign-in"}>
                                        <Button variant="destructive" className="w-full mb-10">Sign-In</Button>
                                    </Link>
                                )
                        }


                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </section>
    )
}

export default MobileNav
