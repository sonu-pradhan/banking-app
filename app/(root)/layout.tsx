export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <main>
        {/* <sidebar> */}
        {children}
    </main>
  );
}
