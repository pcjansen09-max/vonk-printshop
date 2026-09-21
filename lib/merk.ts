/**
 * Alles wat met het merk te maken heeft, op één plek.
 *
 * De kleuren komen uit Vonks eigen huisstijl, opgehaald uit hun logo.svg en
 * hun stylesheet op vonknh.nl. Het logo is letterlijk een vonk: een radiaal
 * verloop van amber naar magenta. Dat verloop is hier het hart van het ontwerp,
 * want een 3D-printer die warm filament uitspuit is diezelfde vonk.
 */
export const MERK = {
  naam: "Vonk Printshop",
  kort: "Printshop",
  plaats: "Schagen",
  school: "Vonk",
  /** Waar de site straks komt te staan.
   *
   *  Dit is alleen de terugval. Zet je de site op Vercel, dan vult Vercel het
   *  echte adres zelf in via de omgevingsvariabele VERCEL_PROJECT_PRODUCTION_URL
   *  (zie app/layout.tsx), dus dan hoef je hier niets te doen. Heb je later een
   *  eigen domein, zet dat dan hier neer.
   *
   *  Waar het voor dient: het adres maakt de plaatjes in een gedeelde link
   *  absoluut. Wijst het naar iets dat niet bestaat, dan blijft de preview in
   *  WhatsApp of LinkedIn leeg. */
  domein: "localhost:3000",
  email: "vonkprintshop@gmail.com",
  telefoon: "0224 21 25 00",
  adres: "Hoep 100, 1741 MC Schagen",
} as const

/** De stops van het vonkverloop, exact zoals in Vonks logo. */
export const VONKVERLOOP = [
  "#f8ab21",
  "#f7a523",
  "#f5952b",
  "#f27a38",
  "#ee564a",
  "#e92761",
  "#e50075",
] as const

export const KLEUR = {
  magenta: "#e50075",
  amber: "#f8ab21",
  inkt: "#17131a",
} as const

/**
 * Levertijd in werkdagen, uit het onderzoek naar de Printshop.
 * Wordt op meerdere plekken getoond, dus één bron.
 */
export const LEVERTIJD = { min: 1, max: 4 } as const
