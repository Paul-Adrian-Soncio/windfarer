"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Logo } from "@/components/ui/Logo";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function AppHeader() {
  const { data: session } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    // Full navigation, not router.push — see the matching note in
    // app/sign-in/page.tsx for why the client router can race the session
    // cache around an auth state change.
    window.location.href = "/sign-in";
  }

  return (
    <header className="relative overflow-hidden bg-hero-gradient px-5 pb-4 pt-4 text-[#F3EFE4]">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
        viewBox="0 0 1120 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g fill="none" stroke="#F3EFE4" strokeWidth="1.1">
          <path d="M-20,70 C220,40 360,86 560,58 S980,34 1160,66" />
          <path d="M-20,84 C220,54 360,100 560,72 S980,48 1160,80" />
          <path d="M-20,54 C220,24 360,70 560,42 S980,18 1160,50" />
          <path d="M-20,40 C220,12 360,56 560,28 S980,6 1160,38" />
        </g>
      </svg>
      <div className="relative mx-auto flex max-w-5xl items-center gap-3">
        <Logo size={40} />
        <div>
          <p className="font-display text-[19px] font-bold leading-tight tracking-tight text-white">WindFarer</p>
          <p className="mt-0.5 text-[11.5px] text-[#CFE0D3]">Your journey, planned with a friend</p>
        </div>
        {session && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-pill border-[1.5px] border-white/25 px-3 py-1.5 text-[12.5px] text-[#F1EFE6] transition-colors hover:bg-white/10"
          >
            <span className="hidden sm:inline">{session.user.email}</span>
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.9} />
          </button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => (signingOut ? undefined : setConfirmOpen(false))}
        title="Sign out?"
      >
        <p className="text-sm text-ink-500">
          You&apos;ll need to sign back in to see your trips again.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={signingOut}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </Modal>
    </header>
  );
}
