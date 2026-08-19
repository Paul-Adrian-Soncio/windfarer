"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Topography } from "@/components/ui/Topography";
import { Logo } from "@/components/ui/Logo";
import { authClient } from "@/lib/auth-client";

// A single page toggles between sign-in and sign-up (rather than two
// separate routes) — one form, one piece of state deciding which Better
// Auth call it submits to.
export default function SignInPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setSubmitError(error.message ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    // A full navigation, not router.push: right after sign-up/sign-in the
    // session cookie is set, but AuthGate's useSession() on a freshly
    // client-routed "/" can still read its pre-auth cached state for a
    // moment and bounce straight back here. Reloading the origin forces a
    // clean request that picks up the new cookie from the start.
    window.location.href = "/";
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-1 items-center justify-center px-4 py-10">
      <div className="grid w-full gap-5 sm:grid-cols-2">
        <div className="relative hidden overflow-hidden rounded-card border border-hair shadow-card sm:block">
          <Topography
            lowColor="#123024"
            midColor="#2e6a50"
            highColor="#c2673f"
            bands={3}
            thickness={0.01}
            glow={0.5}
            speed={0.25}
            morphAmount={1}
            morphSpeed={0.04}
            grainIntensity={0.035}
            mouseStrength={0.3}
            scale={0.75}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3  px-6 text-center">
            <Logo size={52} />
            <p className="font-display text-[22px] font-bold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(18,48,36,0.55)]">
              Welcome to WindFarer!
            </p>
          </div>
        </div>

        <Card className="w-full self-center">
          <CardHeader>
            <CardTitle>
              <Compass
                className="h-[19px] w-[19px] text-primary-700"
                strokeWidth={1.9}
              />
              {mode === "sign-in" ? "Welcome back" : "Start planning"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "sign-up" && (
              <Field label="Name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </Field>

            {submitError && (
              <p className="text-sm text-danger-600">{submitError}</p>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting
                  ? "Please wait…"
                  : mode === "sign-in"
                    ? "Sign in"
                    : "Sign up"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                  setSubmitError(null);
                }}
                className="text-center text-sm text-ink-500 hover:text-primary-700"
              >
                {mode === "sign-in"
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
