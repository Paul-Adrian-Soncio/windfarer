import { AppHeader } from "@/components/layout/AppHeader";
import { TabNav } from "@/components/layout/TabNav";
import { AuthGate } from "@/components/layout/AuthGate";
import { Footer } from "@/components/layout/Footer";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppHeader />
      <TabNav />
      <main className="mx-auto w-full max-w-5xl flex-1 animate-[fade-in-up_0.35s_ease] px-4 py-6 sm:px-6 sm:py-7">
        {children}
      </main>
      <Footer variant="dashboard" />
    </AuthGate>
  );
}
