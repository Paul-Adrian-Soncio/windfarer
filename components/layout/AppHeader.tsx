export function AppHeader() {
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
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(150deg, #3f8f6f, #1f4b3a)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 4px 10px -4px rgba(0,0,0,.4)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] -rotate-[8deg] fill-white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v5z" />
          </svg>
        </span>
        <div>
          <p className="font-display text-[19px] font-bold leading-tight tracking-tight text-white">WindFarer</p>
          <p className="mt-0.5 text-[11.5px] text-[#CFE0D3]">Your journey, planned with a friend</p>
        </div>
      </div>
    </header>
  );
}
