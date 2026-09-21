"use client"

import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ImagePlus, RotateCw, X } from "lucide-react"
import { Knop } from "@/components/ui/Knop"
import { Keuze, Schuif, Teller, Veld } from "@/components/shop/Regelaar"
import { PrijsOpbouw } from "@/components/shop/PrijsOpbouw"
import { FILAMENTEN, PRODUCTEN } from "@/lib/catalogus"
import { berekenPrint3D } from "@/lib/prijs/print3d"
import { LEVERTIJD } from "@/lib/merk"
import { useWinkelwagen } from "@/lib/winkelwagen"

const Kijker = dynamic(() => import("@/components/three/ProductKijker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-inkt-zacht">
      Voorbeeld wordt geladen…
    </div>
  ),
})

const MAX_LOGO_MB = 4

export function Ontwerper() {
  const zoek = useSearchParams()
  const gevraagd = zoek.get("product")
  const eerste =
    PRODUCTEN.find((p) => p.id === gevraagd)?.id ?? PRODUCTEN[0].id

  const [productId, zetProduct] = useState(eerste)
  const [filamentId, zetFilament] = useState(FILAMENTEN[0].id)
  const [aantal, zetAantal] = useState(10)
  const [vulling, zetVulling] = useState(20)
  const [logoUrl, zetLogoUrl] = useState<string | null>(null)
  const [logoNaam, zetLogoNaam] = useState<string | null>(null)
  const [logoFout, zetLogoFout] = useState<string | null>(null)
  const [draait, zetDraait] = useState(true)
  const [gelegdeKeuze, zetGelegdeKeuze] = useState<string | null>(null)

  const invoer = useRef<HTMLInputElement>(null)
  const voegToe = useWinkelwagen((s) => s.voegToe)

  const product = PRODUCTEN.find((p) => p.id === productId)!
  const filament = FILAMENTEN.find((f) => f.id === filamentId)!

  // De blob-url weer vrijgeven, anders houdt de browser het bestand vast zolang
  // het tabblad openstaat.
  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl)
    }
  }, [logoUrl])

  // Bewust afgeleid en niet via een effect: "staat in de wagen" geldt voor de
  // keuze zoals hij toen was. Wijzig je iets, dan klopt die melding niet meer,
  // en dat is een vergelijking en geen neveneffect.
  const keuze = [productId, filamentId, aantal, vulling, logoNaam ?? ""].join("|")
  const toegevoegd = gelegdeKeuze === keuze

  const prijs = useMemo(
    () =>
      berekenPrint3D({
        model: {
          volumeCm3: product.volumeCm3,
          maat: product.maat,
          driehoeken: 0,
        },
        filament,
        vulling,
        laagHoogte: 0.2,
        aantal,
      }),
    [product, filament, vulling, aantal]
  )

  function kiesLogo(bestand: File) {
    zetLogoFout(null)
    if (!bestand.type.startsWith("image/")) {
      zetLogoFout("Kies een afbeelding: een PNG, JPG of SVG.")
      return
    }
    if (bestand.size > MAX_LOGO_MB * 1024 * 1024) {
      zetLogoFout(`Deze afbeelding is groter dan ${MAX_LOGO_MB} MB.`)
      return
    }
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    zetLogoUrl(URL.createObjectURL(bestand))
    zetLogoNaam(bestand.name)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* ---------------------------------------------------- links: voorbeeld */}
      <div>
        <div className="relative aspect-[4/3] border border-rand bg-papier-zacht">
          <Kijker
            id={product.id}
            kleur={filament.hex}
            logoUrl={product.logo ? logoUrl : null}
            maat={product.maat}
            draait={draait}
          />
          <button
            onClick={() => zetDraait((d) => !d)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-rand bg-papier/90 text-inkt-zacht backdrop-blur transition-colors hover:text-inkt"
            aria-label={draait ? "Draaien stoppen" : "Laten draaien"}
          >
            <RotateCw className="h-4 w-4" strokeWidth={1.7} />
          </button>
          <p className="cijfers absolute bottom-3 left-4 text-xs text-inkt-zacht">
            {product.maat.x} × {product.maat.y} × {product.maat.z} mm
          </p>
        </div>

        <div className="mt-4 border border-rand bg-papier p-5">
          <p className="label text-inkt-zacht">{product.voorWie}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {product.naam}
          </h2>
          <p className="mt-2 leading-relaxed text-inkt-zacht">
            {product.omschrijving}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------ rechts: keuzes */}
      <div className="space-y-8">
        <Keuze
          label="Product"
          waarde={productId}
          onWijzig={zetProduct}
          kolommen={2}
          opties={PRODUCTEN.map((p) => ({
            waarde: p.id,
            label: p.naam,
            hulp: p.voorWie,
          }))}
        />

        <Keuze
          label="Kleur"
          waarde={filamentId}
          onWijzig={zetFilament}
          opties={FILAMENTEN.map((f) => ({
            waarde: f.id,
            label: f.naam,
            hulp: f.soort,
            kleur: f.hex,
          }))}
        />

        <Veld label="Je logo">
          {!product.logo ? (
            <p className="border border-rand bg-papier-zacht px-4 py-3 text-sm text-inkt-zacht">
              Op dit product zetten we geen logo. Kies bijvoorbeeld een tapknop
              of een menukaarthouder als je dat wel wilt.
            </p>
          ) : logoUrl ? (
            <div className="flex items-center gap-3 border border-rand bg-papier px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="min-w-0 flex-1 truncate text-sm">{logoNaam}</span>
              <button
                onClick={() => {
                  URL.revokeObjectURL(logoUrl)
                  zetLogoUrl(null)
                  zetLogoNaam(null)
                }}
                className="text-inkt-zacht transition-colors hover:text-magenta"
                aria-label="Logo weghalen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => invoer.current?.click()}
                className="flex w-full items-center gap-3 border border-dashed border-rand-sterk bg-papier-zacht px-4 py-4 text-left transition-colors hover:border-inkt"
              >
                <ImagePlus className="h-5 w-5 shrink-0 text-inkt-zacht" strokeWidth={1.5} />
                <span>
                  <span className="block font-medium">Logo uploaden</span>
                  <span className="block text-sm text-inkt-zacht">
                    PNG met doorzichtige achtergrond werkt het mooist.
                  </span>
                </span>
              </button>
              <input
                ref={invoer}
                type="file"
                accept="image/*"
                className="enkel-voorlezen"
                onChange={(e) => {
                  const b = e.target.files?.[0]
                  if (b) kiesLogo(b)
                }}
              />
            </>
          )}
          {logoFout && (
            <p className="mt-2 text-sm text-magenta">{logoFout}</p>
          )}
        </Veld>

        <Schuif
          label="Vulling"
          waarde={vulling}
          eenheid=" %"
          min={0}
          max={100}
          stap={5}
          onWijzig={zetVulling}
          hulp="Staat het product op een bar of tafel, dan is twintig procent ruim genoeg."
        />

        <Veld label="Aantal">
          <Teller waarde={aantal} onWijzig={zetAantal} max={2000} />
        </Veld>

        <div>
          <PrijsOpbouw
            regels={prijs.regels}
            totaal={prijs.totaal}
            btw={prijs.btw}
            totaalInclusief={prijs.totaalInclusief}
            perStuk={prijs.perStuk}
            aantal={aantal}
          />
          <p className="mt-4 text-sm text-inkt-zacht">
            Klaar in {LEVERTIJD.min} tot {LEVERTIJD.max} werkdagen.{" "}
            {product.logo && !logoUrl
              ? "Zonder logo printen kan ook; je kunt het later nog aanleveren."
              : ""}
          </p>
          <Knop
            soort="vonk"
            className="mt-6 w-full"
            onClick={() => {
              voegToe({
                soort: "ontwerp",
                naam: product.naam,
                omschrijving: [
                  filament.naam,
                  `${vulling} procent vulling`,
                  logoNaam ? `logo ${logoNaam}` : "zonder logo",
                ].join(", "),
                aantal,
                bedrag: prijs.totaal,
                kleurHex: filament.hex,
                keuzes: {
                  product: product.id,
                  filament: filament.id,
                  vulling,
                  logo: logoNaam ?? "",
                },
              })
              zetGelegdeKeuze(keuze)
            }}
          >
            {toegevoegd ? (
              <>
                <Check className="h-4 w-4" /> In de winkelwagen
              </>
            ) : (
              "In winkelwagen"
            )}
          </Knop>
        </div>
      </div>
    </div>
  )
}
