/**
 * Wat de Printshop kan maken en waarmee.
 *
 * De machines en materialen komen uit het eigen onderzoek naar de Printshop:
 * een snijmachine, een printer, een rolprinter voor banners en een
 * 3D-printer, met normaal papier, dik papier en fotopapier, in A4 tot en met
 * A1. Lamineren kan niet: die machine staat er niet.
 */

export type Filament = {
  id: string
  naam: string
  soort: "PLA" | "PETG"
  /** Zoals het eruitziet, voor de weergave op het scherm. */
  hex: string
  /** Gram per kubieke centimeter. */
  dichtheid: number
  /** Inkoopprijs per kilo, in euro. */
  euroPerKilo: number
  /** Kort waarom je dit zou kiezen. */
  waarvoor: string
}

export const FILAMENTEN: Filament[] = [
  { id: "pla-magenta", naam: "Vonk magenta", soort: "PLA", hex: "#e50075", dichtheid: 1.24, euroPerKilo: 24, waarvoor: "Onze huiskleur. Strak en dekkend." },
  { id: "pla-amber", naam: "Vonk amber", soort: "PLA", hex: "#f8ab21", dichtheid: 1.24, euroPerKilo: 24, waarvoor: "Warm en opvallend, valt op de bar meteen op." },
  { id: "pla-zwart", naam: "Diepzwart", soort: "PLA", hex: "#1b1719", dichtheid: 1.24, euroPerKilo: 22, waarvoor: "Rustig en tijdloos, laat een logo goed uitkomen." },
  { id: "pla-wit", naam: "Gebroken wit", soort: "PLA", hex: "#f2efe9", dichtheid: 1.24, euroPerKilo: 22, waarvoor: "Neutraal, goed als er nog een sticker op moet." },
  { id: "pla-hout", naam: "Houtlook", soort: "PLA", hex: "#a9743f", dichtheid: 1.28, euroPerKilo: 34, waarvoor: "Warme uitstraling voor een bruin café." },
  { id: "petg-transparant", naam: "Transparant", soort: "PETG", hex: "#cfe4e8", dichtheid: 1.27, euroPerKilo: 29, waarvoor: "Doorschijnend en sterker. Goed voor menukaarthouders." },
  { id: "petg-groen", naam: "Diepgroen", soort: "PETG", hex: "#1f5c3d", dichtheid: 1.27, euroPerKilo: 29, waarvoor: "Sterk en weerbestendig, kan ook buiten staan." },
]

export type PapierSoort = "normaal" | "dik" | "fotopapier"

export const PAPIER: Record<PapierSoort, { naam: string; toelichting: string; factor: number }> = {
  normaal: { naam: "Normaal papier", toelichting: "120 grams. Voor flyers en programmakaarten.", factor: 1 },
  dik: { naam: "Dik papier", toelichting: "250 grams karton. Stevig genoeg om rechtop te zetten.", factor: 1.7 },
  fotopapier: { naam: "Fotopapier", toelichting: "Glanzend, diepe kleuren. Voor posters die moeten opvallen.", factor: 2.6 },
}

export type Product = {
  id: string
  naam: string
  voorWie: string
  omschrijving: string
  /** Geschat volume in kubieke centimeters, voor de richtprijs. */
  volumeCm3: number
  maat: { x: number; y: number; z: number }
  /** Kan hier een logo op? */
  logo: boolean
  vanafPrijs: number
}

/**
 * De producten uit het klantonderzoek. Café 't Heremetijdje is de eerste klant,
 * dus de menukaarthouder en de tapknop staan vooraan.
 */
export const PRODUCTEN: Product[] = [
  {
    id: "menukaarthouder",
    naam: "Menukaarthouder",
    voorWie: "Horeca",
    omschrijving: "Staat op tafel en houdt je kaart rechtop. Wisselt je kaart, dan hoef je alleen het papier te vervangen.",
    volumeCm3: 34,
    maat: { x: 110, y: 45, z: 90 },
    logo: true,
    vanafPrijs: 7.5,
  },
  {
    id: "tapknop",
    naam: "Tapknop",
    voorWie: "Horeca",
    omschrijving: "Eigen knop per speciaalbier, met je logo of de naam van het bier erop. Nieuw bier op de tap is een nieuwe knop.",
    volumeCm3: 21,
    maat: { x: 45, y: 45, z: 95 },
    logo: true,
    vanafPrijs: 6.5,
  },
  {
    id: "tafelnummer",
    naam: "Tafelnummer",
    voorWie: "Horeca",
    omschrijving: "Genummerde bordjes voor reserveringen en feesten. Los te bestellen per nummer.",
    volumeCm3: 12,
    maat: { x: 60, y: 40, z: 70 },
    logo: false,
    vanafPrijs: 4.5,
  },
  {
    id: "proeverijbordje",
    naam: "Proeverijbordje",
    voorWie: "Horeca",
    omschrijving: "Bordje bij een bierproeverij met de naam en het alcoholpercentage. Klik de kaartjes erin en wissel ze per proeverij.",
    volumeCm3: 16,
    maat: { x: 80, y: 35, z: 55 },
    logo: true,
    vanafPrijs: 5.5,
  },
  {
    id: "displaystandaard",
    naam: "Displaystandaard",
    voorWie: "Kapsalon en retail",
    omschrijving: "Standaard voor producten aan de balie, in je eigen kleur in plaats van standaard uit de groothandel.",
    volumeCm3: 58,
    maat: { x: 150, y: 90, z: 120 },
    logo: true,
    vanafPrijs: 12.5,
  },
  {
    id: "sleutelhanger",
    naam: "Sleutelhanger",
    voorWie: "Verenigingen en toerisme",
    omschrijving: "Met clublogo of een streekvorm. Ook in kleine aantallen, dus je hoeft er geen duizend te bestellen.",
    volumeCm3: 4,
    maat: { x: 55, y: 30, z: 6 },
    logo: true,
    vanafPrijs: 3.5,
  },
  {
    id: "folderhouder",
    naam: "Folderhouder",
    voorWie: "Musea en VVV",
    omschrijving: "Houder voor folders in A5 of A6, past bij je eigen kleuren.",
    volumeCm3: 47,
    maat: { x: 160, y: 70, z: 110 },
    logo: true,
    vanafPrijs: 10.5,
  },
  {
    id: "vervangonderdeel",
    naam: "Vervangonderdeel",
    voorWie: "Bouw en installatie",
    omschrijving: "Klem, afstandhouder of mal die niet meer te koop is. Stuur je model of een foto met maten.",
    volumeCm3: 9,
    maat: { x: 60, y: 40, z: 25 },
    logo: false,
    vanafPrijs: 8.5,
  },
]
