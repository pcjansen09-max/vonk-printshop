"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WagenRegel } from "@/lib/winkelwagen"

/**
 * Bestellingen die deze browser geplaatst heeft.
 *
 * Net als de winkelwagen staat dit voorlopig lokaal. De vorm is die van een
 * rij in een tabel, zodat dit straks in Supabase past zonder dat de pagina's
 * mee hoeven veranderen.
 */

export type Bestelling = {
  nummer: string
  geplaatstOp: string
  naam: string
  bedrijf: string
  email: string
  telefoon: string
  ophalen: boolean
  opmerking: string
  regels: WagenRegel[]
  totaal: number
}

type Boek = {
  bestellingen: Bestelling[]
  bewaar: (b: Bestelling) => void
  laatste: () => Bestelling | null
}

export const useBestellingen = create<Boek>()(
  persist(
    (set, get) => ({
      bestellingen: [],
      bewaar: (b) =>
        set((s) => ({ bestellingen: [b, ...s.bestellingen].slice(0, 50) })),
      laatste: () => get().bestellingen[0] ?? null,
    }),
    { name: "vonk-printshop-bestellingen" }
  )
)

/**
 * Een bestelnummer in onze eigen vorm: VP-jaar-volgnummer.
 *
 * Het volgnummer komt nu uit de tijd, zodat twee bestellingen achter elkaar
 * nooit hetzelfde nummer krijgen. Zodra er een database is, geeft die het
 * nummer uit; dan is het ook echt oplopend.
 */
export function nieuwBestelnummer(nu: Date): string {
  const volg = String(
    (nu.getHours() * 3600 + nu.getMinutes() * 60 + nu.getSeconds()) % 10000
  ).padStart(4, "0")
  return `VP-${nu.getFullYear()}-${volg}`
}
