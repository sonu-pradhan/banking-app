import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }: LayoutProps<"/">) {

  const loggedIn = { fName: "Arun", lName: "Singh" };

  return (
    <main className="flex min-h-screen w-full font-inter">
      <Sidebar user={loggedIn} />

      <div className="min-w-0 flex-1">
        {children}
      </div>
    </main>
  );
}
