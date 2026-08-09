import type { Metadata } from "next";
import { spaceGrotesk, inter, spaceMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "WindFarer — Your travel planning companion",
  description: "Plan every leg of your next adventure — travel, itinerary, and budget, all in one cozy place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink-700">{children}</body>
    </html>
  );
}
