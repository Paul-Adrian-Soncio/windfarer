"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

// Wraps every tab (Home, Planner, Itinerary, Budget) — sits above TripGate,
// not instead of it: this checks "is anyone signed in," TripGate checks "do
// they have a trip yet." Placed once in app/(tabs)/layout.tsx rather than
// per-page like TripGate, since every tab (including Planner, which
// deliberately skips TripGate) needs a session before it can call the API.
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <div className="py-24 text-center text-sm text-ink-500">Loading…</div>;
  }

  if (!session) {
    // Redirect above is already in flight — render nothing rather than a
    // flash of gated content while it happens.
    return null;
  }

  return <>{children}</>;
}
