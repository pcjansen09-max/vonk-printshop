"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { centen } from "@/lib/prijs/geld"

/**
 * De winkelwagen.
 *
 * Staat voorlopig in de browser van de klant. Zodra de site aan het
 * schoolaccount van Supabase hangt, verhuizen deze regels naar een tabel en
 * blijft alleen deze vorm over. Daarom is een regel bewust vlak en zonder
 * verwijzingen naar objecten die alleen in het geheugen bestaan: zo is hij
 * later één op één op te slaan.
 */

export type WagenRegel = {
  id: string
  soort: "print3d" | "drukwerk" | "banner" | "ontwerp"
  naam: string
  omschrijving: string
  aantal: number
  /** Prijs exclusief btw voor de hele regel. */
  bedrag: number
  /** Waar de klant op geklikt heeft; om de regel te kunnen herbouwen. */
  keuzes: Record<string, string | number | boolean>
  kleurHex?: string
  /** Het bestand dat de klant meestuurde. Alleen de naam: het bestand zelf
   *  blijft op zijn eigen computer tot de Printshop erom vraagt. */
  bestandsnaam?: string
}

type Wagen = {
  regels: WagenRegel[]
  voegToe: (r: Omit<WagenRegel, "id">) => void
  verwijder: (id: string) => void
  wijzigAantal: (id: string, aantal: number) => void
  leeg: () => void
  aantalStuks: () => number
  totaal: () => number
}

function sleutel(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useWinkelwagen = create<Wagen>()(
  persist(
    (set, get) => ({
      regels: [],

      voegToe: (regel) =>
        set((s) => ({ regels: [...s.regels, { ...regel, id: sleutel() }] })),

      verwijder: (id) =>
        set((s) => ({ regels: s.regels.filter((r) => r.id !== id) })),

      wijzigAantal: (id, aantal) =>
        set((s) => ({
          regels: s.regels.map((r) =>
            r.id === id
              ? {
                  // Het bedrag hoort mee te schalen, anders staat er straks een
                  // prijs van vier stuks bij een aantal van twintig.
                  ...r,
                  aantal: Math.max(1, aantal),
                  bedrag: centen((r.bedrag / r.aantal) * Math.max(1, aantal)),
                }
              : r
          ),
        })),

      leeg: () => set({ regels: [] }),

      aantalStuks: () => get().regels.reduce((s, r) => s + r.aantal, 0),

      totaal: () => centen(get().regels.reduce((s, r) => s + r.bedrag, 0)),
    }),
    { name: "vonk-printshop-winkelwagen" }
  )
)

/**
 * Is de winkelwagen al uit de opslag van de browser geladen?
 *
 * De server weet niet wat er in jouw winkelwagen zit, dus daar staat hij leeg.
 * Zou de browser bij de eerste tekening meteen drie regels tonen, dan wijkt die
 * tekening af van wat de server stuurde en gooit React de hele boom weg. Dat
 * gebeurde ook: "Hydration failed because the server rendered HTML didn't
 * match".
 *
 * Daarom begint dit altijd op false, ook in de browser, en gaat het pas na de
 * eerste tekening aan. Server en browser tekenen dan hetzelfde en daarna komt
 * de echte inhoud erin.
 */
export function useWagenKlaar(): boolean {
  const [klaar, zetKlaar] = useState(false)
  useEffect(() => {
    if (useWinkelwagen.persist.hasHydrated()) {
      const id = requestAnimationFrame(() => zetKlaar(true))
      return () => cancelAnimationFrame(id)
    }
    return useWinkelwagen.persist.onFinishHydration(() => zetKlaar(true))
  }, [])
  return klaar
}
