import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

/**
 * Knoppen staan hoekig, niet rond. Dat past bij een werkplaats waar met
 * snijmachines en platen gewerkt wordt, en het houdt de pagina strak.
 * Het opschrift staat in mono-kapitalen: dat is de technische stem van de site.
 */
type Soort = "vol" | "lijn" | "vonk"

const basis =
  "label inline-flex items-center justify-center gap-2 px-5 h-11 transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"

const soorten: Record<Soort, string> = {
  vol: "bg-inkt text-white hover:bg-magenta",
  lijn: "border border-rand-sterk text-inkt hover:border-inkt bg-papier",
  vonk: "vonk-vlak text-white hover:opacity-90",
}

export function Knop({
  soort = "vol",
  className = "",
  children,
  ...rest
}: { soort?: Soort; children: ReactNode } & ComponentProps<"button">) {
  return (
    <button className={`${basis} ${soorten[soort]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function KnopLink({
  soort = "vol",
  className = "",
  children,
  ...rest
}: { soort?: Soort; children: ReactNode } & ComponentProps<typeof Link>) {
  return (
    <Link className={`${basis} ${soorten[soort]} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
