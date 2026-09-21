import type { Filament } from "@/lib/catalogus"
import { BTW, centen, getal, staffel, type Regel } from "./geld"

/**
 * Wat een 3D-print kost.
 *
 * De klant krijgt de opbouw te zien en niet alleen een getal. Dat is precies
 * het verschil met de printshops die nu via de mail werken: daar wacht je een
 * dag op een prijs zonder te weten waar hij vandaan komt.
 *
 * De som is bewust natuurkundig en niet verzonnen. Materiaal volgt uit het
 * volume van het model, tijd volgt uit hoeveel plastic de printer per seconde
 * kwijt kan. Daardoor klopt het gedrag ook bij instellingen die we nooit
 * getest hebben: een fijnere laag duurt langer, meer vulling kost meer.
 */

/** De plaat van onze printer, in millimeters. */
export const BOUWVOLUME = { x: 256, y: 256, z: 256 } as const

const TARIEF = {
  /** Machine plus toezicht, per uur. */
  euroPerUur: 12,
  /** Instellen, van de plaat halen, nakijken en inpakken. Eén keer per opdracht. */
  voorbereiding: 4.5,
  /** Hieronder gaan we niet: ook een klein printje kost aandacht. */
  bodemprijs: 3.5,
  /** Opwarmen en uitlijnen, één keer per opdracht. */
  opstartMinuten: 6,
} as const

const PRINTER = {
  /** Breedte van één geprint lijntje. */
  lijnbreedteMm: 0.42,
  /** Hoe snel de kop beweegt, gemiddeld over een echte print. */
  snelheidMmPerSec: 60,
  /** Wanden en de dichte boven- en onderkant zitten er altijd op, ook bij
   *  nul procent vulling. Dit is het deel van het volume dat massief is. */
  schilAandeel: 0.22,
  /** Steunmateriaal, een mislukte eerste laag, restjes. */
  verliesFactor: 1.05,
} as const

export type ModelMaat = {
  volumeCm3: number
  maat: { x: number; y: number; z: number }
  driehoeken: number
}

export type Print3DVraag = {
  model: ModelMaat
  filament: Filament
  /** Vulling in procenten, 0 tot 100. */
  vulling: number
  /** Laaghoogte in millimeters. */
  laagHoogte: number
  aantal: number
}

export type Print3DPrijs = {
  regels: Regel[]
  subtotaal: number
  totaal: number
  perStuk: number
  btw: number
  totaalInclusief: number
  materiaalGram: number
  printMinuten: number
  bodemprijs: number
  past: boolean
  waarschuwing: string | null
}

/** Past het model op de plaat? Draaien mag, dus we vergelijken de maten
 *  gesorteerd: een lange platte plaat past ook als hij dwars ligt. */
export function pastOpDePlaat(maat: { x: number; y: number; z: number }): boolean {
  const model = [maat.x, maat.y, maat.z].sort((a, b) => a - b)
  const plaat = [BOUWVOLUME.x, BOUWVOLUME.y, BOUWVOLUME.z].sort((a, b) => a - b)
  return model.every((m, i) => m <= plaat[i] + 0.001)
}

export function berekenPrint3D(vraag: Print3DVraag): Print3DPrijs {
  const { model, filament, aantal } = vraag
  if (aantal < 1) throw new Error("Een aantal begint bij één.")

  const vulling = Math.min(100, Math.max(0, vraag.vulling)) / 100
  const laagHoogte = Math.min(0.4, Math.max(0.05, vraag.laagHoogte))

  // Massief deel plus de vulling in wat overblijft.
  const materiaalCm3 =
    model.volumeCm3 *
    (PRINTER.schilAandeel + (1 - PRINTER.schilAandeel) * vulling) *
    PRINTER.verliesFactor

  const gramPerStuk = materiaalCm3 * filament.dichtheid
  const materiaalGram = gramPerStuk * aantal

  // Hoeveel plastic de printer per seconde kwijt kan, bij deze laaghoogte.
  const doorvoerMm3PerSec =
    laagHoogte * PRINTER.lijnbreedteMm * PRINTER.snelheidMmPerSec
  const minutenPerStuk = (materiaalCm3 * 1000) / doorvoerMm3PerSec / 60
  const printMinuten = minutenPerStuk * aantal + TARIEF.opstartMinuten

  const materiaalKosten = centen((materiaalGram / 1000) * filament.euroPerKilo)
  const tijdKosten = centen((printMinuten / 60) * TARIEF.euroPerUur)
  const voorbereiding = TARIEF.voorbereiding

  const regels: Regel[] = [
    {
      wat: "Materiaal",
      toelichting: `${getal(materiaalGram)} gram ${filament.naam.toLowerCase()}`,
      bedrag: materiaalKosten,
    },
    {
      wat: "Printtijd",
      toelichting: `${Math.round(printMinuten)} minuten op de printer`,
      bedrag: tijdKosten,
    },
    {
      wat: "Voorbereiding",
      toelichting: "Instellen, van de plaat halen en nakijken",
      bedrag: voorbereiding,
    },
  ]

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

  const past = pastOpDePlaat(model.maat)

  return {
    regels,
    subtotaal,
    totaal,
    perStuk: centen(totaal / aantal),
    btw,
    totaalInclusief: centen(totaal + btw),
    materiaalGram: Math.round(materiaalGram * 10) / 10,
    printMinuten: Math.round(printMinuten),
    bodemprijs: TARIEF.bodemprijs,
    past,
    waarschuwing: past
      ? null
      : `Dit model past niet op onze plaat van ${BOUWVOLUME.x} bij ${BOUWVOLUME.y} bij ${BOUWVOLUME.z} millimeter. We kunnen het in delen printen; vraag het even aan ons.`,
  }
}
