/**
 * Is dit bestand scherp genoeg voor wat je ervan wilt maken?
 *
 * Dit is de vraag die op een printshop het vaakst te laat gesteld wordt. Iemand
 * levert een plaatje van het scherm aan, wij drukken het af op A2, en dan staat
 * er iets blokkerigs op de muur. Omdat dit in de browser te berekenen is, hoort
 * het antwoord te komen op het moment dat je het bestand kiest, niet als de
 * poster al gedrukt is.
 *
 * De drempel hangt af van waar het ding komt te hangen. Een poster bekijk je van
 * een meter afstand en die wil je scherp; een spandoek aan een hek zie je van
 * twintig meter en dat mag veel grover. Daar strenger over doen dan nodig is,
 * keurt bruikbare bestanden af.
 */

export type Soort = "poster" | "banner"

/** Punten per inch die we minimaal willen zien. */
export const DREMPEL: Record<Soort, number> = {
  poster: 120,
  banner: 40,
}

/** Hieronder is het echt te weinig, ook voor een spandoek. */
const ONBRUIKBAAR: Record<Soort, number> = {
  poster: 72,
  banner: 25,
}

const CM_PER_INCH = 2.54

export type Oordeel = {
  dpi: number
  goed: boolean
  onbruikbaar: boolean
  verhoudingKlopt: boolean
  advies: string
  /** Hoe groot dit bestand op deze drempel maximaal kan. */
  maxBreedteCm: number
}

export function beoordeelBestand({
  pixelsBreed,
  pixelsHoog,
  breedteCm,
  hoogteCm,
  soort,
}: {
  pixelsBreed: number
  pixelsHoog: number
  breedteCm: number
  hoogteCm: number
  soort: Soort
}): Oordeel {
  const drempel = DREMPEL[soort]

  if (breedteCm <= 0 || hoogteCm <= 0 || pixelsBreed <= 0 || pixelsHoog <= 0) {
    return {
      dpi: 0,
      goed: false,
      onbruikbaar: true,
      verhoudingKlopt: true,
      advies: "Kies eerst een formaat, dan kunnen we het bestand beoordelen.",
      maxBreedteCm: 0,
    }
  }

  // De krapste van de twee richtingen bepaalt hoe scherp het wordt.
  const dpiBreed = pixelsBreed / (breedteCm / CM_PER_INCH)
  const dpiHoog = pixelsHoog / (hoogteCm / CM_PER_INCH)
  const dpi = Math.round(Math.min(dpiBreed, dpiHoog))

  const verhoudingBestand = pixelsBreed / pixelsHoog
  const verhoudingDruk = breedteCm / hoogteCm
  // Tien procent scheef mag: dat valt binnen de afloop die er toch af gaat.
  const verhoudingKlopt =
    Math.abs(verhoudingBestand - verhoudingDruk) / verhoudingDruk < 0.1

  const goed = dpi >= drempel
  const onbruikbaar = dpi < ONBRUIKBAAR[soort]
  const maxBreedteCm =
    Math.round((pixelsBreed / drempel) * CM_PER_INCH * 10) / 10
  // Nederlandse komma: een punt in een maat leest als een tikfout.
  const maxBreedteTekst = maxBreedteCm.toFixed(1).replace(".", ",")

  let advies: string
  if (onbruikbaar) {
    advies =
      `Dit bestand is ${dpi} punten per inch op dit formaat en dat wordt ` +
      `blokkerig. Op ${maxBreedteTekst} centimeter breed komt het wel goed, of ` +
      `stuur een groter bestand.`
  } else if (!goed) {
    advies =
      `Dit kan net, maar scherp wordt het niet: ${dpi} punten per inch waar we ` +
      `er ${drempel} willen. Een groter bestand is beter.`
  } else if (!verhoudingKlopt) {
    advies =
      `Scherp genoeg. Wel heeft je bestand een andere verhouding dan het ` +
      `formaat, dus we moeten bijsnijden. Zeg even wat er weg mag, anders ` +
      `kiezen wij en dat wordt uitgerekt of afgesneden.`
  } else {
    advies = `Scherp genoeg: ${dpi} punten per inch op dit formaat.`
  }

  if (!verhoudingKlopt && (onbruikbaar || !goed)) {
    advies += " En de verhouding wijkt af, dus er moet ook bijgesneden worden."
  }

  return { dpi, goed, onbruikbaar, verhoudingKlopt, advies, maxBreedteCm }
}
