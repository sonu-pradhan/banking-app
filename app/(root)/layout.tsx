import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function RootLayout({ children }: LayoutProps<"/">) {

  const loggedIn = { fName: "Arun", lName: "Singh" };

  return (
    <main className="flex min-h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="min-w-0 flex-1">
        <div className="md:hidden flex h-12 items-center justify-between p-2 shadow-creditCard sm:p-8">
          <Image src="/logo.jpeg" width={30} height={30} alt="logo" />
          <div>
            <MobileNav user={loggedIn} />
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
