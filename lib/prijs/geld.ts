/** Alles wat met bedragen te maken heeft, op één plek. */

export const BTW = 0.21

/** Naar hele centen. Bedragen die je optelt moeten al afgerond zijn, anders
 *  loopt het subtotaal een cent uit de pas met de regels erboven. */
export function centen(bedrag: number): number {
  return Math.round(bedrag * 100) / 100
}

export function euro(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(bedrag)
}

export type Regel = { wat: string; toelichting: string; bedrag: number }

/**
 * Staffelkorting op het aantal.
 *
 * Waarom dit bestaat: een café bestelt tien tapknoppen, geen één. De machine
 * hoeft dan maar één keer op te warmen en er hoeft maar één keer ingesteld te
 * worden. Die winst hoort naar de klant, anders koopt hij ze online.
 */
export function staffel(aantal: number): number {
  if (aantal >= 250) return 0.7
  if (aantal >= 100) return 0.78
  if (aantal >= 50) return 0.85
  if (aantal >= 25) return 0.9
  if (aantal >= 10) return 0.95
  return 1
}

/**
 * Een getal zoals je het in het Nederlands schrijft: met een komma.
 *
 * Stond er eerst als "21.6 cm3" en "0.2 mm". Op een Nederlandse site leest dat
 * als een fout, en bij maten en gewichten valt het meteen op.
 */
export function getal(waarde: number, decimalen = 1): string {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: decimalen,
    maximumFractionDigits: decimalen,
  }).format(waarde)
}
