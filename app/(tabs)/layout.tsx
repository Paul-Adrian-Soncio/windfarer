import { AppHeader } from "@/components/layout/AppHeader";
import { TabNav } from "@/components/layout/TabNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <TabNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
