import { BTW, centen, staffel, type Regel } from "./geld"

/**
 * Wat een banner kost.
 *
 * Anders dan drukwerk op A-formaat: een banner koop je op maat, en dus per
 * vierkante meter. De prijs bestaat uit het doek, de afwerking (ogen om hem op
 * te hangen, een zoom zodat de rand niet uitscheurt) en het klaarzetten.
 *
 * De rol is 150 centimeter breed. Wil je breder, dan moet er gelast worden en
 * dat is geen knop op een website; dan zeggen we dat en bellen we erover.
 */

/** Zo breed is de rol op onze printer. */
export const MAX_BREEDTE_CM = 150
/** Hieronder rekenen we toch een halve vierkante meter: snijden en afwerken
 *  kosten hetzelfde, hoe klein het doek ook is. */
const MINIMUM_M2 = 0.5
/** Om de vijftig centimeter een oog langs de rand. */
const OOG_OM_DE_CM = 50

export type BannerMateriaal = "pvc" | "mesh" | "textiel"

export const BANNERMATERIAAL: Record<
  BannerMateriaal,
  { naam: string; toelichting: string; euroPerM2: number }
> = {
  pvc: {
    naam: "Pvc-doek",
    toelichting: "510 grams, weerbestendig. De gewone keuze voor buiten.",
    euroPerM2: 16,
  },
  mesh: {
    naam: "Mesh",
    toelichting: "Met gaatjes, zodat de wind erdoorheen kan. Voor hekken en steigers.",
    euroPerM2: 21,
  },
  textiel: {
    naam: "Textiel",
    toelichting: "Mat en zonder glans. Mooiste binnen, bijvoorbeeld achter de bar.",
    euroPerM2: 29,
  },
}

const TARIEF = {
  oog: 0.45,
  zoomPerMeter: 1.8,
  voorbereiding: 4.5,
  bodemprijs: 12,
} as const

export type BannerVraag = {
  breedteCm: number
  hoogteCm: number
  materiaal: BannerMateriaal
  /** Ringen langs de rand om hem mee op te hangen. */
  ogen: boolean
  /** Omgezette en gelaste rand, zodat hij niet uitscheurt. */
  zoom: boolean
  aantal: number
}

export type BannerPrijs = {
  regels: Regel[]
  subtotaal: number
  totaal: number
  perStuk: number
  btw: number
  totaalInclusief: number
  m2: number
  m2Gerekend: number
  aantalOgen: number
}

export function berekenBanner(vraag: BannerVraag): BannerPrijs {
  const { breedteCm, hoogteCm, materiaal, ogen, zoom, aantal } = vraag
  if (aantal < 1) throw new Error("Een aantal begint bij één.")
  if (breedteCm <= 0 || hoogteCm <= 0) throw new Error("Vul een maat in.")
  if (breedteCm > MAX_BREEDTE_CM && hoogteCm > MAX_BREEDTE_CM) {
    throw new Error(
      `Onze rol is ${MAX_BREEDTE_CM} centimeter breed, dus één van beide maten ` +
        `moet daaronder blijven. Wil je hem groter, bel ons dan even.`
    )
  }

  const m2 = (breedteCm / 100) * (hoogteCm / 100)
  const m2Gerekend = Math.max(MINIMUM_M2, Math.round(m2 * 100) / 100)
  const soort = BANNERMATERIAAL[materiaal]

  const omtrekM = ((breedteCm + hoogteCm) * 2) / 100
  const aantalOgen = ogen ? Math.max(4, Math.round((omtrekM * 100) / OOG_OM_DE_CM)) : 0

  const regels: Regel[] = [
    {
      wat: `Banner op ${soort.naam.toLowerCase()}`,
      toelichting: `${breedteCm} bij ${hoogteCm} cm, ${m2Gerekend.toFixed(2).replace(".", ",")} m² per stuk, ${aantal} stuks`,
      bedrag: centen(m2Gerekend * soort.euroPerM2 * aantal),
    },
  ]

  if (ogen) {
    regels.push({
      wat: "Ogen langs de rand",
      toelichting: `${aantalOgen} per banner, om de ${OOG_OM_DE_CM} centimeter`,
      bedrag: centen(aantalOgen * TARIEF.oog * aantal),
    })
  }
  if (zoom) {
    regels.push({
      wat: "Zoom rondom",
      toelichting: `${omtrekM.toFixed(1).replace(".", ",")} meter omgezette rand per banner`,
      bedrag: centen(omtrekM * TARIEF.zoomPerMeter * aantal),
    })
  }

  regels.push({
    wat: "Voorbereiding",
    toelichting: "Bestand klaarzetten, proef en afwerken",
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
    m2: Math.round(m2 * 1000) / 1000,
    m2Gerekend,
    aantalOgen,
  }
}
