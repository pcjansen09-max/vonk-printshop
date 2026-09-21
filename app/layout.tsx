import type { Metadata } from "next"
import { Figtree, JetBrains_Mono } from "next/font/google"
import { MERK } from "@/lib/merk"
import { Kop } from "@/components/layout/Kop"
import { Voet } from "@/components/layout/Voet"
import "./globals.css"

// Proxima Nova is Vonks eigen letter, maar die zit achter een Typekit-licentie
// en mag hier niet mee. Figtree is er de dichtstbijzijnde vrije verwant van:
// hetzelfde geometrisch-humanistische karakter en het houdt zich goed op grote
// koppen. JetBrains Mono draagt de labels en de cijfers.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
})

const mono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  // Op Vercel staat het echte adres in VERCEL_PROJECT_PRODUCTION_URL, dus daar
  // klopt dit vanzelf. Lokaal valt hij terug op MERK.domein.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : `http://${MERK.domein}`
  ),
  title: {
    default: `${MERK.naam} — 3D printen en drukwerk uit ${MERK.plaats}`,
    template: `%s — ${MERK.naam}`,
  },
  description:
    "Upload je model, zie meteen wat het kost en volg je print live. 3D printen, posters en drukwerk voor ondernemers in Schagen en omstreken.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: MERK.naam,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${figtree.variable} ${mono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#inhoud"
          className="enkel-voorlezen focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:h-auto focus:w-auto focus:bg-inkt focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Naar de inhoud
        </a>
        <Kop />
        <main id="inhoud" className="flex-1">
          {children}
        </main>
        <Voet />
      </body>
    </html>
  )
}
