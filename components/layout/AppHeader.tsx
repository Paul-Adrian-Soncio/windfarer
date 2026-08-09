import Image from "next/image";

export function AppHeader() {
  return (
    <header className="bg-hero-gradient">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
        <Image src="/logo.svg" alt="WindFarer" width={40} height={40} className="rounded-xl shadow-soft" />
        <div>
          <p className="font-display text-lg font-semibold leading-tight text-white">WindFarer</p>
          <p className="text-xs text-primary-100">Your journey, planned with a friend</p>
        </div>
      </div>
    </header>
  );
}
