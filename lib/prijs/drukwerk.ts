import { PAPIER, type PapierSoort } from "@/lib/catalogus"
import { BTW, centen, staffel, type Regel } from "./geld"

/**
 * Wat drukwerk kost: posters, flyers, programmakaarten.
 *
 * De Printshop kan A4 tot en met A1 op normaal papier, dik papier en
 * fotopapier, en heeft een snijmachine staan. Een lamineermachine is er niet,
 * dus die keuze staat hier ook niet. Verder gaat het niet: drukken en bedrukken
 * kunnen we niet, dat staat ook zo op de site.
 */

export type Formaat = {
  id: "a4" | "a3" | "a2" | "a1"
  naam: string
  mm: { breedte: number; hoogte: number }
  /** Oppervlak ten opzichte van A4. A3 is twee A4, A2 is vier, A1 is acht. */
  vellen: number
}

export const FORMATEN: Formaat[] = [
  { id: "a4", naam: "A4", mm: { breedte: 210, hoogte: 297 }, vellen: 1 },
  { id: "a3", naam: "A3", mm: { breedte: 297, hoogte: 420 }, vellen: 2 },
  { id: "a2", naam: "A2", mm: { breedte: 420, hoogte: 594 }, vellen: 4 },
  { id: "a1", naam: "A1", mm: { breedte: 594, hoogte: 841 }, vellen: 8 },
]

const TARIEF = {
  /** Inkt en papier voor één A4 enkelzijdig op normaal papier. */
  perA4: 0.18,
  /** Een tweede zijde kost inkt maar geen extra vel. */
  tweedeZijde: 0.7,
  /** Klaarzetten van het bestand en de machine. Eén keer per opdracht. */
  voorbereiding: 3.5,
  bodemprijs: 2.5,
} as const

export type DrukwerkVraag = {
  formaat: Formaat
  papier: PapierSoort
  aantal: number
  dubbelzijdig: boolean
}

export type DrukwerkPrijs = {
  regels: Regel[]
  subtotaal: number
  totaal: number
  perStuk: number
  btw: number
  totaalInclusief: number
}

export function berekenDrukwerk(vraag: DrukwerkVraag): DrukwerkPrijs {
  const { formaat, papier, aantal, dubbelzijdig } = vraag
  if (aantal < 1) throw new Error("Een aantal begint bij één.")

  const soort = PAPIER[papier]
  const perStukPrint =
    TARIEF.perA4 *
    formaat.vellen *
    soort.factor *
    (dubbelzijdig ? 1 + TARIEF.tweedeZijde : 1)

  const regels: Regel[] = [
    {
      wat: `Printen op ${soort.naam.toLowerCase()}`,
      toelichting: `${aantal} keer ${formaat.naam}${dubbelzijdig ? ", dubbelzijdig" : ""}`,
      bedrag: centen(perStukPrint * aantal),
    },
  ]

  regels.push({
    wat: "Voorbereiding",
    toelichting: "Bestand klaarzetten, proefdruk en snijden",
    bedrag: TARIEF.voorbereiding,
  })

  const subtotaal = centen(regels.reduce((s, r) => s + r.bedrag, 0))
  const korting = staffel(aantal)
  if (korting < 1) {
    regels.push({
      wat: "Staffelkorting",
      toelichting: `${aantal} stuks, ${Math.round((1 - korting) * 100)} procent eraf`,
      bedrag: centen(-subtotaal * (1 - korting)),
    })
  }

  const naKorting = centen(regels.reduce((s, r) => s + r.bedrag, 0))
  const totaal = centen(Math.max(naKorting, TARIEF.bodemprijs))
  const btw = centen(totaal * BTW)

  return {
    regels,
    subtotaal,
    totaal,
    perStuk: centen(totaal / aantal),
    btw,
    totaalInclusief: centen(totaal + btw),
  }
}
