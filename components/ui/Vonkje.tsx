/**
 * Het merkteken: het vonkje uit Vonks logo.
 *
 * Overgetrokken uit hun eigen logo.svg, met hetzelfde radiale verloop van
 * amber naar magenta. Het staat naast het woord Printshop en verder nergens,
 * zodat het een merkteken blijft en geen versiering wordt.
 */
export function Vonkje({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id="vonkje" cx="55%" cy="18%" r="82%">
          <stop offset="0.39" stopColor="#f8ab21" />
          <stop offset="0.56" stopColor="#f5952b" />
          <stop offset="0.79" stopColor="#ee564a" />
          <stop offset="1" stopColor="#e50075" />
        </radialGradient>
      </defs>
      <path
        fill="url(#vonkje)"
        d="M126 8c-6 26-20 44-42 62-26 21-42 40-42 68a58 58 0 0 0 116 0c0-18-8-31-8-45 0-12 6-22 18-32-4 30 24 34 24 70a84 84 0 0 1-168 4c0-44 26-64 54-88C104 26 120 16 126 8Z"
      />
    </svg>
  )
}
