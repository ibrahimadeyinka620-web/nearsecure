export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Veritrail logo">
      <rect x="2" y="2" width="44" height="44" rx="12" className="fill-primary" />
      <path d="M12 14 24 35 36 14" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-gold" />
      <circle cx="12" cy="14" r="4" className="fill-gold" />
      <circle cx="24" cy="35" r="4" className="fill-gold" />
      <circle cx="36" cy="14" r="4" className="fill-primary-foreground" />
    </svg>
  );
}
