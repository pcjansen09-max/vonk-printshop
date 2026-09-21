/**
 * De stand van een print.
 *
 * Dit is de naad waar de printer straks aan vastgeknoopt wordt. De vorm
 * hieronder is met opzet die van OctoPrint en Moonraker: voortgang, laag,
 * temperaturen en resterende tijd. Zodra de printer een sleutel heeft, wordt
 * `haalStatus` een verzoek naar dat adres en verandert er verder niets aan de
 * pagina's die deze gegevens tonen.
 *
 * Tot die tijd rekent hij de stand uit. Dat is bewust geen willekeur: dezelfde
 * bestelling geeft altijd hetzelfde verloop, zodat je kunt verversen zonder dat
 * de print terugspringt.
 */

export type Staat = "wachtrij" | "opwarmen" | "printen" | "klaar" | "opgehaald"

export type PrintStatus = {
  bestelnummer: string
  product: string
  kleurHex: string
  staat: Staat
  /** 0 tot 1. */
  voortgang: number
  laag: number
  lagenTotaal: number
  nozzleC: number
  plaatC: number
  restMinuten: number
  /** Zolang de printer nog niet gekoppeld is, staat dit op false en zeggen we
   *  dat er ook bij. Een demo die zich voordoet als echt is erger dan geen demo. */
  echteData: boolean
}

export const STAAT_TEKST: Record<Staat, string> = {
  wachtrij: "In de wachtrij",
  opwarmen: "Aan het opwarmen",
  printen: "Aan het printen",
  klaar: "Klaar om op te halen",
  opgehaald: "Opgehaald",
}

/** Een getal tussen 0 en 1 dat altijd hetzelfde is voor dezelfde tekst. */
function zaad(tekst: string): number {
  let h = 2166136261
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

/**
 * De voorbeelden zijn bewust producten met hoogte. Een sleutelhanger is zes
 * millimeter dik; daar zie je het laag voor laag opbouwen niet op, en juist dat
 * is wat dit scherm moet laten zien.
 */
const VOORBEELDEN = [
  { product: "Tapknop met logo, 12 stuks", kleurHex: "#e50075", lagen: 476, duurMin: 214 },
  { product: "Menukaarthouder, 8 stuks", kleurHex: "#1b1719", lagen: 452, duurMin: 268 },
  { product: "Displaystandaard, 4 stuks", kleurHex: "#f8ab21", lagen: 601, duurMin: 342 },
]

/**
 * De stand van één bestelling.
 *
 * @param nu Het tijdstip waarop je kijkt. Wordt meegegeven in plaats van hier
 *           opgehaald, zodat dit uit te rekenen en te toetsen is.
 */
export function haalStatus(bestelnummer: string, nu: Date): PrintStatus {
  const z = zaad(bestelnummer)
  const voorbeeld = VOORBEELDEN[Math.floor(z * VOORBEELDEN.length)]

  // Een cyclus van vijf minuten, zodat je op de pagina echt iets ziet bewegen
  // in plaats van dat je een uur moet wachten op één procent.
  const cyclusMs = 5 * 60 * 1000
  const positie = ((nu.getTime() + z * cyclusMs) % cyclusMs) / cyclusMs

  if (positie < 0.06) {
    return {
      bestelnummer,
      product: voorbeeld.product,
      kleurHex: voorbeeld.kleurHex,
      staat: "wachtrij",
      voortgang: 0,
      laag: 0,
      lagenTotaal: voorbeeld.lagen,
      nozzleC: 24,
      plaatC: 23,
      restMinuten: voorbeeld.duurMin,
      echteData: false,
    }
  }

  if (positie < 0.13) {
    const opwarm = (positie - 0.06) / 0.07
    return {
      bestelnummer,
      product: voorbeeld.product,
      kleurHex: voorbeeld.kleurHex,
      staat: "opwarmen",
      voortgang: 0,
      laag: 0,
      lagenTotaal: voorbeeld.lagen,
      nozzleC: Math.round(24 + opwarm * 186),
      plaatC: Math.round(23 + opwarm * 37),
      restMinuten: voorbeeld.duurMin,
      echteData: false,
    }
  }

  if (positie < 0.93) {
    const gedaan = (positie - 0.13) / 0.8
    return {
      bestelnummer,
      product: voorbeeld.product,
      kleurHex: voorbeeld.kleurHex,
      staat: "printen",
      voortgang: gedaan,
      laag: Math.max(1, Math.round(gedaan * voorbeeld.lagen)),
      lagenTotaal: voorbeeld.lagen,
      // Een echte printer wiebelt een graad of twee om zijn instelling heen.
      nozzleC: Math.round(210 + Math.sin(nu.getTime() / 9000 + z * 6) * 1.6),
      plaatC: 60,
      restMinuten: Math.max(1, Math.round(voorbeeld.duurMin * (1 - gedaan))),
      echteData: false,
    }
  }

  return {
    bestelnummer,
    product: voorbeeld.product,
    kleurHex: voorbeeld.kleurHex,
    staat: "klaar",
    voortgang: 1,
    laag: voorbeeld.lagen,
    lagenTotaal: voorbeeld.lagen,
    nozzleC: Math.round(210 - (positie - 0.93) / 0.07 * 150),
    plaatC: Math.round(60 - (positie - 0.93) / 0.07 * 34),
    restMinuten: 0,
    echteData: false,
  }
}

/** Ziet een bestelnummer eruit zoals wij ze uitgeven? */
export const BESTELNUMMER = /^VP-20\d{2}-\d{4}$/

export function normaliseerBestelnummer(invoer: string): string {
  return invoer.trim().toUpperCase().replace(/\s+/g, "")
}
