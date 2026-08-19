"use client";

import Link from "next/link";
import {
  MapPinned,
  CalendarRange,
  Wallet,
  CloudSun,
  Clock,
  MousePointerClick,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Topography } from "@/components/ui/Topography";
import { Logo } from "@/components/ui/Logo";

const CORE_FEATURES = [
  {
    icon: MapPinned,
    title: "Travel Planner",
    description:
      "Log every leg of getting there and back — flights, trains, layovers, where you're staying, anything booked ahead of time. One place for the logistics, so nothing gets lost in a dozen confirmation emails.",
  },
  {
    icon: CalendarRange,
    title: "Itinerary Planner",
    description:
      "Build out each day once you've landed. Drag activities, meals, and local transit into place, reorder on the fly, and keep every day organized without fighting a spreadsheet.",
  },
  {
    icon: Wallet,
    title: "Budget",
    description:
      "Set a total budget and watch it update automatically as you plan — travel, stays, activities, everything rolled up by category and by day, so you always know where the money's going.",
  },
];

const EXTRA_FEATURES = [
  {
    icon: Clock,
    title: "Countdown & weather",
    description:
      "A live countdown to departure and a real forecast for your destination, right on your home screen.",
  },
  {
    icon: MousePointerClick,
    title: "Drag-and-drop itinerary",
    description:
      "Rearrange blocks within a day or move them to a different one — the whole plan updates instantly.",
  },
  {
    icon: CloudSun,
    title: "Built for real trips",
    description:
      "Multi-currency budgets, layovers, advance bookings — the details real travel planning actually needs.",
  },
];

export default function WelcomePage() {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="relative overflow-hidden bg-hero-gradient">
        {/* Topography's canvas is alpha-blended (transparent between contour
            lines) — same component as the sign-in page, but sitting on the
            app's own dark hero gradient here instead of the light paper
            background sign-in's small card sits on, since at full-viewport
            width the pattern alone reads too washed-out against paper for
            hero text to stay legible without it. */}
        <div className="absolute inset-0">
          <Topography
            lowColor="#123024"
            midColor="#3f8f6f"
            highColor="#c2673f"
            bands={3}
            thickness={0.01}
            glow={0.5}
            speed={0.25}
            morphAmount={1}
            morphSpeed={0.04}
            grainIntensity={0.035}
            mouseStrength={0.3}
            scale={1.75}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
          <Logo size={64} />
          <h1 className="mt-6 font-display text-[34px] font-bold leading-tight tracking-tight text-white sm:text-[46px]">
            Plan your next trip
            <br />
            like you&apos;ve got a friend for it
          </h1>
          <p className="mt-4 max-w-xl text-[15.5px] text-[#E4EFE7] sm:text-[17px]">
            WindFarer keeps your travel, day-by-day itinerary, and budget in one
            cozy place — so the planning feels as good as the trip itself.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-in">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                Get started — it&apos;s free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="lg"
                className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-16 sm:px-6 sm:py-20">
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[26px] font-bold tracking-tight text-ink-900 sm:text-[30px]">
              Three tabs. Everything you need.
            </h2>
            <p className="mt-3 text-[15px] text-ink-500">
              No juggling apps or tabs full of half-finished spreadsheets —
              travel, itinerary, and budget all live together and stay in sync.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {CORE_FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader className="mb-3">
                  <CardTitle>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-tint">
                      <Icon
                        className="h-[19px] w-[19px] text-primary-700"
                        strokeWidth={1.9}
                      />
                    </span>
                  </CardTitle>
                </CardHeader>
                <p className="font-display text-[16px] font-bold text-ink-900">
                  {title}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
                  {description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-hair bg-surface p-6 sm:p-8">
          <h2 className="font-display text-[22px] font-bold tracking-tight text-ink-900">
            And the little things too
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {EXTRA_FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-2">
                <Icon className="h-5 w-5 text-primary-700" strokeWidth={1.9} />
                <p className="font-display text-[14.5px] font-semibold text-ink-900">
                  {title}
                </p>
                <p className="text-[13px] leading-relaxed text-ink-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex flex-col items-center gap-4 overflow-hidden rounded-card bg-hero-gradient px-6 py-12 text-center sm:py-16">
          <div className="absolute inset-0">
            <Topography
              lowColor="#123024"
              midColor="#3f8f6f"
              highColor="#c2673f"
              bands={3}
              thickness={0.01}
              glow={0.5}
              speed={0.25}
              morphAmount={1}
              morphSpeed={0.04}
              grainIntensity={0.035}
              mouseStrength={0.3}
              scale={1.75}
            />
          </div>
          <div className="relative flex flex-col items-center gap-4">
            <h2 className="font-display text-[24px] font-bold tracking-tight text-white sm:text-[28px]">
              Ready to plan your next adventure?
            </h2>
            <p className="max-w-md text-[14.5px] text-[#E4EFE7]">
              Create an account and start building your trip in a couple of
              minutes.
            </p>
            <Link href="/sign-in">
              <Button variant="accent" size="lg" className="mt-2">
                Start planning
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hair py-6 text-center text-[12.5px] text-ink-500">
        WindFarer — your journey, planned with a friend.
      </footer>
    </div>
  );
}
